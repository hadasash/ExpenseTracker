const mongoose = require("mongoose");

let invoicesSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    description: "Unique identifier for the invoice"
  },
  providerName: {
    type: String,
    required: true,
    description: "Unique identifier for the business or client"
  },
  year: {
    type: Number,
    required: true,
    description: "The year the invoice was issued"
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    description: "The month the invoice was issued (1-12)"
  },
  totalAmount: {
    type: Number,
    required: true,
    description: "Total amount of the invoice"
  },
  category: {
    type: String,
    enum: ["Employee Salary", "Marketing", "Office Supplies", "Travel Expenses", "Utilities", "food","Other"],
    required: true,
    description: "Category of the expense chosen from a predefined list"
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
    description: "Timestamp for when the invoice record was created"
  },
  
});

module.exports = mongoose.model("Invoice", invoicesSchema);
