const mongoose = require("mongoose");

let expensesSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    description: "Unique identifier for the expense"
  },
  providerName: {
    type: String,
    required: true,
    description: "Unique identifier for the business or client"
  },
  year: {
    type: Number,
    required: true,
    description: "The year the expense was issued"
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    description: "The month the expense was issued (1-12)"
  },
  totalAmount: {
    type: Number,
    required: true,
    description: "Total amount of the expense"
  },
  category: {
    type: String,
    enum: ["Employee Salary", "Marketing", "Office Supplies", "Travel Expenses", "Utilities", "food","Other"],
    required: true,
    description: "Category of the expense chosen from a predefined list"
  },
  typeOfExpense: {
    type: String,
    enum: ["Invoice", "Payslip"],
    required: true,
    description: "Type of expense"
  },
  details: [{
    itemName: {
      type: String,
      required: true,
      description: "Name of the item"
    },
    itemCost: {
      type: Number,
      required: true,
      description: "Cost of the item"
    },
    quantity: {
      type: Number,
      description: "Quantity of the item (if applicable)"
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    description: "Timestamp for when the expense record was created"
  },
  
});

module.exports = mongoose.model("Expense", expensesSchema);
