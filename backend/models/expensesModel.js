const mongoose = require('mongoose');
const { expenseCategoryEnum, expenseSubCategoryEnum } = require('../constants/enums');

const categorySubcategoryMap = {
  [expenseCategoryEnum.COST_OF_REVENUES]: [
    expenseSubCategoryEnum.SALARIES_AND_RELATED,
    expenseSubCategoryEnum.COMMISSIONS,
    expenseSubCategoryEnum.EQUIPMENT_AND_SOFTWARE,
    expenseSubCategoryEnum.OFFICE_EXPENSES,
    expenseSubCategoryEnum.VEHICLE_MAINTENANCE,
    expenseSubCategoryEnum.DEPRECIATION
  ],
  [expenseCategoryEnum.GENERAL_EXPENSES]: [
    expenseSubCategoryEnum.MANAGEMENT_SERVICES,
    expenseSubCategoryEnum.PROFESSIONAL_SERVICES,
    expenseSubCategoryEnum.ADVERTISING,
    expenseSubCategoryEnum.RENT_AND_MAINTENANCE,
    expenseSubCategoryEnum.POSTAGE_AND_COMMUNICATIONS,
    expenseSubCategoryEnum.OFFICE_AND_OTHER
  ]
};

const getMainCategoryForSubcategory = (subCategory) => {
  for (const [mainCategory, subCategories] of Object.entries(categorySubcategoryMap)) {
    if (subCategories.includes(subCategory)) {
      return mainCategory;
    }
  }
  return null;
};

const baseExpenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    description: 'The date the expense was issued'
  },
  totalAmount: {
    type: Number,
    description: 'Total amount of the expense'
  },
  mainCategory: {
    type: String,
    enum: Object.values(expenseCategoryEnum),
    required: true,
    description: 'Main category of the expense (Cost of Revenues or General Expenses)'
  },
  subCategory: {
    type: String,
    enum: Object.values(expenseSubCategoryEnum),
    required: true,
    description: 'Subcategory of the expense'
  },
  expenseType: {
    type: String,
    enum: ['invoice', 'salarySlip', 'manual'],
    description: 'Type of expense document'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: 'Timestamp for when the record was created'
  },
  providerName: {
    type: String,
    description: 'Name of the business or service provider'
  },
  currency: {
    type: String,
    description: 'Currency of the expense'
  },
});

const invoiceSpecificFields = new mongoose.Schema({
  invoiceId: {
    type: String,
    description: 'Unique identifier for the invoice composed by invoice number and company name',
    example: '001-hot-mobile',
  },
  invoiceNumber: {
    type: Number,
    description: 'Invoice number'
  },
  invoiceTotal: {
    type: Number,
    description: 'The total amount of the invoice'
  },
});

const salarySlipSpecificFields = new mongoose.Schema({
  salarySlipId: {
    type: String,
    description: 'Unique id composed by employee id, company name, month and year',
  },
  employeeId: {
    type: String,
    description: 'Unique identifier for the employee'
  },
  employeeName: {
    type: String,
    description: 'Name of the employee'
  },
  employeeNumber: {
    type: Number,
    description: 'Employee number'
  },
  grossSalary: {
    type: Number,
    description: 'Gross salary amount before deductions'
  },
  netSalary: {
    type: Number,
    description: 'Net salary amount after deductions'
  },
});

const manualExpenseSpecificFields = new mongoose.Schema({
  manualInterval: {
    type: String,
    enum: ['monthly', 'yearly'],
    description: 'Interval for manual expense'
  },
  intervalEndDate: {
    type: Date,
    description: 'End date for the manual expense, optional'
  },
  manualTotalAmount: {
    type: Number,
    description: 'Amount for the manual expense'
  },
  note: {
    type: String,
    description: 'Description for the manual expense'
  },
});

baseExpenseSchema.pre('validate', function(next) {
  // Auto-correct the mainCategory based on the subCategory if needed
  const correctMainCategory = getMainCategoryForSubcategory(this.subCategory);
  if (correctMainCategory && this.mainCategory !== correctMainCategory) {
    this.mainCategory = correctMainCategory;
  }
  
  // Validate the category-subcategory relationship
  if (!categorySubcategoryMap[this.mainCategory]?.includes(this.subCategory)) {
    return next(new Error(`Invalid subcategory "${this.subCategory}" for main category "${this.mainCategory}"`));
  }

  next();
});

baseExpenseSchema.pre('save', function(next) {
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
  } else if (this.expenseType === 'manual') {
    if (this.manualTotalAmount) {
      this.totalAmount = this.manualTotalAmount;
    }
  } else {
    return next(new Error('Invalid expense type'));
  }
  next();
});

const BaseExpenseModel = mongoose.model('BaseExpense', baseExpenseSchema, 'expenses');
const InvoiceExpenseModel = BaseExpenseModel.discriminator('InvoiceExpense', invoiceSpecificFields);
const SalarySlipExpenseModel = BaseExpenseModel.discriminator('SalarySlipExpense', salarySlipSpecificFields);
const ManualExpenseModel = BaseExpenseModel.discriminator('ManualExpense', manualExpenseSpecificFields);

module.exports = {
  BaseExpenseModel,
  InvoiceExpenseModel,
  SalarySlipExpenseModel,
  ManualExpenseModel,
  expenseCategoryEnum,
  expenseSubCategoryEnum,
  categorySubcategoryMap
};