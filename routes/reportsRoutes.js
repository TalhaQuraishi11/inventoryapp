const express = require("express");
const Sales = require("../models/sales");
const router = express.Router();

// Test route to check sales data
router.get("/test-sales", async (req, res) => {
  try {
    const allSales = await Sales.find().limit(5);
    const totalSales = await Sales.countDocuments();
    res.json({
      totalSales,
      sampleSales: allSales,
      message: "Sales data check",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate sales report based on date range
router.get("/sales-report", async (req, res) => {
  const { startDate, endDate } = req.query;

  console.log("Report generation requested:", { startDate, endDate });

  try {
    // First, let's check if there are any sales records
    const totalSales = await Sales.countDocuments();
    console.log("Total sales records in database:", totalSales);

    if (totalSales === 0) {
      return res.status(200).json([]);
    }

    // Check if dates are provided
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    // Convert dates to proper format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Set time to cover the full day
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999);

    console.log("Date range for filtering:", { startDateObj, endDateObj });

    // First, let's see what sales records exist in the date range
    const salesInRange = await Sales.find({
      date: {
        $gte: startDateObj,
        $lte: endDateObj,
      },
    });

    console.log("Sales records found in date range:", salesInRange.length);

    const report = await Sales.aggregate([
      {
        $match: {
          date: {
            $gte: startDateObj,
            $lte: endDateObj,
          },
        },
      },
      {
        $group: {
          _id: "$productName",
          totalSales: { $sum: "$price" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { totalSales: -1 }, // Sort by total sales descending
      },
    ]);

    console.log("Generated report:", report);
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    res
      .status(500)
      .json({ message: "Error generating report", error: error.message });
  }
});

module.exports = router;
