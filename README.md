# Inventory Management System - Backend

This is the backend API for the Inventory Management System built with Node.js, Express, and MongoDB.

## Features

- User authentication (login/signup)
- Employee management (CRUD operations)
- Supplier management (CRUD operations)
- Inventory management (CRUD operations)
- Sales management (CRUD operations)
- Order management (CRUD operations)
- Report generation
- Password change functionality

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the backend directory with your MongoDB connection string:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:4000`

## API Endpoints

### Authentication

- `POST /api/login` - User login
- `POST /api/signup` - User registration
- `POST /api/change-password` - Change password

### Employees

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Add new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Inventory

- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory/add` - Add new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Sales

- `GET /api/sales/` - Get all sales records
- `POST /api/sales/add` - Add new sales record
- `PUT /api/sales/:id` - Update sales record
- `DELETE /api/sales/:id` - Delete sales record

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Add new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Reports

- `GET /api/reports/sales-report` - Generate sales report

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (Cross-Origin Resource Sharing)

## Project Structure

```
backend/
├── models/          # Database models
├── routes/          # API routes
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## License

This project is licensed under the MIT License.
"# inventoryapp" 
