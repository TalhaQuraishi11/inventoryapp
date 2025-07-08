const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const User = require("./models/User"); // Ensure this path is correct
const Report = require("./models/generatereportmodel");
const supplierRoutes = require("./routes/supplierRoutes"); // Ensure this path is correct
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesRoutes = require("./routes/salesRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const PDFDocument = require("pdfkit");

const app = express();
const PORT = 4000;
const JWT_SECRET = "SFFFFFFRTYUNBVCXSWERYYRV";

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://talhaabid400:1234567890@cluster0.bv32bzn.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

// Routes
app.use("/api/suppliers", supplierRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/sales", salesRoutes);

app.use("/api/reports", reportsRoutes);

// Routes
app.use("/api/employees", employeeRoutes);

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    return res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Signup route
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/logout", (req, res) => {
  // Clear the token on the server-side (if using server-side sessions)
  res.clearCookie("token");
  return res.status(200).json({ message: "Logged out successfully" });
});

// Change password route
app.post("/api/change-password", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  productName: String,
  quantity: Number,
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// API to handle order creation
app.post("/api/orders", async (req, res) => {
  const { customerName, productName, quantity, price } = req.body;

  try {
    const newOrder = new Order({ customerName, productName, quantity, price });
    await newOrder.save();

    // Return success response with order details
    res.status(201).json({
      success: true,
      message: `Order for ${customerName} has been successfully created!`,
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to create order",
      message: "An error occurred while creating the order. Please try again.",
    });
  }
});

// API to get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// API to update an order
app.put("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.customerName = req.body.customerName || order.customerName;
      order.productName = req.body.productName || order.productName;
      order.quantity = req.body.quantity || order.quantity;
      order.price = req.body.price || order.price;

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// API to delete an order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate sales report as PDF
app.get("/api/reports/sales-report/pdf", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const report = await Sales.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: {
          _id: "$productName",
          totalSales: { $sum: "$price" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    // Create a PDF document
    const doc = new PDFDocument();

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`From: ${startDate} To: ${endDate}`);
    doc.moveDown();

    doc.fontSize(14).text("Product Name", 50, 100);
    doc.fontSize(14).text("Total Sales", 200, 100);
    doc.fontSize(14).text("Total Quantity", 350, 100);

    doc.moveDown();

    report.forEach((item) => {
      doc.fontSize(14).text(item._id, 50, doc.y + 10);
      doc.fontSize(14).text(`$${item.totalSales}`, 200, doc.y + 10);
      doc.fontSize(14).text(item.totalQuantity, 350, doc.y + 10);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "Failed to generate sales report PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
