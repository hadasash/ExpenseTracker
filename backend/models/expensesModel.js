const mongoose = require('mongoose');

const baseExpenseSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    description: 'The year the expense was issued'
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    description: 'The month the expense was issued (1-12)'
  },
  totalAmount: {
    type: Number,
    description: 'Total amount of the expense'
  },
  category: {
    type: String,
    enum: ['Employee Salary', 'Marketing', 'Office Supplies', 'Travel Expenses', 'Utilities', 'Food', 'Other'],
    required: true,
    description: 'Category of the expense chosen from a predefined list'
  },
  expenseType: {
    type: String,
    enum: ['invoice', 'salarySlip'],
    required: true,
    description: 'Type of expense document'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: 'Timestamp for when the record was created'
  }
});

const invoiceSpecificFields = new mongoose.Schema({
  invoiceId: {
    type: String,
    description: 'Unique identifier for the invoice composed by invoice number and company name',
    example: '001-hot-mobile',
  },
  invoiceNumber: {
    type: Number,
    required: true,
    description: 'Invoice number'
  },
  providerName: {
    type: String,
    required: true,
    description: 'Name of the business or service provider'
  },
  invoiceTotal: {
    type: Number,
    //required: true,
    description: 'The total amount of the invoice'
  },
});

const salarySlipSpecificFields = new mongoose.Schema({
  employeeId: {
    type: String,
    //required: true,
    description: 'Unique identifier for the employee'
  },
  employeeName: {
    type: String,
    //required: true,
    description: 'Name of the employee'
  },
  employeeNumber: {
    type: Number,
    description: 'Employee number'
  },
  grossSalary: {
    type: Number,
    //required: true,
    description: 'Gross salary amount before deductions'
  },
  netSalary: {
    type: Number,
    //required: true,
    description: 'Net salary amount after deductions'
  },
  department: {
    type: String,
    description: 'Employee\'s department'
  }
});


baseExpenseSchema.pre('save', function(next) {
  console.log('Pre save hook for BaseExpenseModel', this);
  
  if (this.expenseType === 'invoice') {
    if (this.invoiceTotal) {
      this.totalAmount = this.invoiceTotal;

    } else {
      return next(new Error('Invoice total is required for invoice expense type'));
    }
  } else if (this.expenseType === 'salarySlip') {
    if (this.grossSalary) {
      this.totalAmount = this.grossSalary;
    } else {
      return next(new Error('Gross salary amount is required for salary slip expense type'));
    }
  } else {
    return next(new Error('Invalid expense type'));
  }
  next();
});

const BaseExpenseModel = mongoose.model('BaseExpense', baseExpenseSchema, 'expenses');
const InvoiceExpenseModel = BaseExpenseModel.discriminator('InvoiceExpense', invoiceSpecificFields);
const SalarySlipExpenseModel = BaseExpenseModel.discriminator('SalarySlipExpense', salarySlipSpecificFields);

module.exports = { BaseExpenseModel, InvoiceExpenseModel, SalarySlipExpenseModel };

