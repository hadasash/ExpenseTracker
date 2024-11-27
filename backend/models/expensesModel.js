// const mongoose = require('mongoose');

// const baseExpenseSchema = new mongoose.Schema({
//   year: {
//     type: Number,
//     required: true,
//     description: 'The year the expense was issued'
//   },
//   month: {
//     type: Number,
//     required: true,
//     min: 1,
//     max: 12,
//     description: 'The month the expense was issued (1-12)'
//   },
//   totalAmount: {
//     type: Number,
//     description: 'Total amount of the expense'
//   },
//   category: {
//     type: String,
//     enum: ['Employee Salary', 'Marketing', 'Office Supplies', 'Travel Expenses', 'Utilities', 'Food', 'Other'],
//     required: true,
//     description: 'Category of the expense chosen from a predefined list'
//   },
//   expenseType: {
//     type: String,
//     enum: ['invoice', 'salarySlip'],
//     required: true,
//     description: 'Type of expense document'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//     description: 'Timestamp for when the record was created'
//   }
// });

// const invoiceSpecificFields = new mongoose.Schema({
//   invoiceId: {
//     type: String,
//     description: 'Unique identifier for the invoice composed by invoice number and company name',
//     example: '001-hot-mobile',
//   },
//   invoiceNumber: {
//     type: Number,
//     required: true,
//     description: 'Invoice number'
//   },
//   providerName: {
//     type: String,
//     required: true,
//     description: 'Name of the business or service provider'
//   },
//   invoiceTotal: {
//     type: Number,
//     //required: true,
//     description: 'The total amount of the invoice'
//   },
// });

// const salarySlipSpecificFields = new mongoose.Schema({
//   salarySlipId: {
//     type: String,
//     //required: true,
//     description: 'Unique identifier for the salary slip composed by employee id, company name, month and year',
//   },
//   employeeId: {
//     type: String,
//     //required: true,
//     description: 'Unique identifier for the employee'
//   },
//   employeeName: {
//     type: String,
//     //required: true,
//     description: 'Name of the employee'
//   },
//   employeeNumber: {
//     type: Number,
//     description: 'Employee number'
//   },
//   grossSalary: {
//     type: Number,
//     //required: true,
//     description: 'Gross salary amount before deductions'
//   },
//   netSalary: {
//     type: Number,
//     //required: true,
//     description: 'Net salary amount after deductions'
//   },
//   companyName: {
//     type: String,
//     description: 'Name of the company'
//   },
// });

// baseExpenseSchema.pre('save', function(next) {
//   console.log('Pre save hook for BaseExpenseModel', this);
  
//   if (this.expenseType === 'invoice') {
//     if (this.invoiceTotal) {
//       this.totalAmount = this.invoiceTotal;
//     } else {
//       return next(new Error('Invoice total is required for invoice expense type'));
//     }
//   } else if (this.expenseType === 'salarySlip') {
//     if (this.grossSalary) {
//       this.totalAmount = this.grossSalary;
//     } else {
//       return next(new Error('Gross salary amount is required for salary slip expense type'));
//     }
//   } else {
//     return next(new Error('Invalid expense type'));
//   }
//   next();
// });

// const BaseExpenseModel = mongoose.model('BaseExpense', baseExpenseSchema, 'expenses');
// const InvoiceExpenseModel = BaseExpenseModel.discriminator('InvoiceExpense', invoiceSpecificFields);
// const SalarySlipExpenseModel = BaseExpenseModel.discriminator('SalarySlipExpense', salarySlipSpecificFields);

// module.exports = { BaseExpenseModel, InvoiceExpenseModel, SalarySlipExpenseModel };

const mongoose = require('mongoose');

const expenseCategoryEnum = {
  COST_OF_REVENUES: 'costOfRevenues',
  GENERAL_EXPENSES: 'generalExpenses'
};

const expenseSubCategoryEnum = {
  // Cost of Revenues subcategories
  SALARIES_AND_RELATED: 'salariesAndRelated',
  COMMISSIONS: 'commissions',
  EQUIPMENT_AND_SOFTWARE: 'equipmentAndSoftware',
  OFFICE_EXPENSES: 'officeExpenses',
  VEHICLE_MAINTENANCE: 'vehicleMaintenance',
  DEPRECIATION: 'depreciation',
  
  // General Expenses subcategories
  MANAGEMENT_SERVICES: 'managementServices',
  PROFESSIONAL_SERVICES: 'professionalServices',
  ADVERTISING: 'advertising',
  RENT_AND_MAINTENANCE: 'rentAndMaintenance',
  POSTAGE_AND_COMMUNICATIONS: 'postageAndCommunications',
  OFFICE_AND_OTHER: 'officeAndOther'
};

// Define the category-subcategory relationships
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

// Helper function to automatically determine the main category based on subcategory
const getMainCategoryForSubcategory = (subCategory) => {
  for (const [mainCategory, subCategories] of Object.entries(categorySubcategoryMap)) {
    if (subCategories.includes(subCategory)) {
      return mainCategory;
    }
  }
  return null;
};

const baseExpenseSchema = new mongoose.Schema({
  // year: {
  //   type: Number,
  //   required: true,
  //   description: 'The year the expense was issued'
  // },
  // month: {
  //   type: Number,
  //   required: true,
  //   min: 1,
  //   max: 12,
  //   description: 'The month the expense was issued (1-12)'
  // },
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
    enum: ['invoice', 'salarySlip'],
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

// Pre-validation middleware
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
  } else {
    return next(new Error('Invalid expense type'));
  }
  next();
});

const BaseExpenseModel = mongoose.model('BaseExpense', baseExpenseSchema, 'expenses');
const InvoiceExpenseModel = BaseExpenseModel.discriminator('InvoiceExpense', invoiceSpecificFields);
const SalarySlipExpenseModel = BaseExpenseModel.discriminator('SalarySlipExpense', salarySlipSpecificFields);

module.exports = {
  BaseExpenseModel,
  InvoiceExpenseModel,
  SalarySlipExpenseModel,
  expenseCategoryEnum,
  expenseSubCategoryEnum,
  categorySubcategoryMap
};