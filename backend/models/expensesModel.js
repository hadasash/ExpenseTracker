const mongoose = require('mongoose');
const axios = require('axios');
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

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function fetchOfficialExchangeRate(currency, date) {
  // Mapping of currencies to Bank of Israel API series codes
  const currencySeriesCodes = {
    'USD': 'RER_USD_ILS',
    'EUR': 'RER_EUR_ILS',
    'GBP': 'RER_GBP_ILS',
    'CAD': 'RER_CAD_ILS',
    'AUD': 'RER_AUD_ILS'
  };

  // Comprehensive logging function
  const logConversionAttempt = (method, details) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: method,
      currency: currency,
      date: date instanceof Date ? date.toISOString() : date,
      ...details
    }, null, 2));
  };

  try {
    // Validate and normalize input
    if (!currency) {
      logConversionAttempt('validation', { error: 'No currency provided' });
      throw new Error('Currency is required for conversion');
    }

    // Normalize date
    const conversionDate = date instanceof Date ? date : new Date(date);
    if (isNaN(conversionDate.getTime())) {
      logConversionAttempt('validation', { error: 'Invalid date provided' });
      throw new Error('Invalid date for conversion');
    }

    // Check if the date is in the future
    const today = new Date();
    const isFutureDate = conversionDate > today;

    // Comprehensive currency mapping with fallback rates
    const currencyRates = {
      'USD': { 
        seriesCode: 'RER_USD_ILS',
        defaultRate: 3.7,
        symbol: '$'
      },
      'EUR': { 
        seriesCode: 'RER_EUR_ILS',
        defaultRate: 4.0,
        symbol: '€'
      }
    };

    // Check if currency is supported
    const currencyConfig = currencyRates[currency];
    if (!currencyConfig) {
      logConversionAttempt('unsupported_currency', { 
        message: 'Currency not supported',
        supportedCurrencies: Object.keys(currencyRates)
      });
      return currencyConfig?.defaultRate || 1;
    }

    // If it's a future date, use the default rate
    if (isFutureDate) {
      const defaultRate = currencyConfig?.defaultRate || 1;
      
      logConversionAttempt('future_date_rate', { 
        rate: defaultRate,
        source: 'Default Rate',
        note: 'Using default rate for future date'
      });
      
      return defaultRate;
    }

    // Format date for API
    const formattedDate = formatDate(conversionDate);

    // First, attempt to fetch from Bank of Israel's new API
    try {
      // Construct the API URL for the specific currency and date
      const apiUrl = `https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/${currencyConfig.seriesCode}?startperiod=${formattedDate}&endperiod=${formattedDate}&format=sdmx-json`;
      
      console.log(`Attempting to fetch exchange rate from Bank of Israel API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        timeout: 5000, // 5-second timeout
        headers: {
          'User-Agent': 'ExpenseTracker/1.0',
          'Accept': 'application/vnd.sdmx.data+json'
        }
      });

      // Parse SDMX-JSON response
      const dataSets = response.data?.data?.dataSets;
      if (dataSets && dataSets.length > 0) {
        const series = dataSets[0].series;
        const seriesKeys = Object.keys(series);
        
        if (seriesKeys.length > 0) {
          const observations = series[seriesKeys[0]].observations;
          const observationKeys = Object.keys(observations);
          
          if (observationKeys.length > 0) {
            const rateValue = parseFloat(observations[observationKeys[0]][0]);

            if (!isNaN(rateValue)) {
              logConversionAttempt('boi_success', { 
                rate: rateValue,
                source: 'Bank of Israel New API (SDMX-JSON)',
                date: formattedDate
              });
              return rateValue;
            }
          }
        }
      }

      console.warn(`No valid rate found in API response for ${currency} on ${formattedDate}`);
    } catch (boiError) {
      console.error('Bank of Israel API Error:', {
        message: boiError.message,
        response: boiError.response ? boiError.response.data : 'No response',
        status: boiError.response ? boiError.response.status : 'Unknown'
      });

      logConversionAttempt('boi_error', { 
        message: boiError.message,
        fallbackUsed: true
      });
    }

    // Fallback: use default rate
    const defaultRate = currencyConfig?.defaultRate || 1;
    
    logConversionAttempt('fallback_rate', { 
      rate: defaultRate,
      source: 'Default Rate',
      note: 'Using default rate due to API failure'
    });
    
    return defaultRate;

  } catch (error) {
    // Ultimate error handling
    console.error('Critical error in currency conversion:', {
      currency: currency,
      date: date,
      errorMessage: error.message,
      errorStack: error.stack
    });

    // Always return a safe default
    return 1;
  }
}

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
    default: 'ILS',
    description: 'Currency of the expense'
  },
  convertedAmountILS: {
    type: Number,
    description: 'Amount converted to Israeli Shekels'
  },
  conversionRate: {
    type: Number,
    description: 'Exchange rate used for conversion'
  },
  conversionDate: {
    type: Date,
    description: 'Date used for currency conversion'
  }
}, {
  methods: {
    async convertToILS() {
      if (this.currency === 'ILS') {
        this.convertedAmountILS = this.totalAmount;
        this.conversionRate = 1;
        return;
      }

      try {
        const conversionDate = this.date || new Date();
        const exchangeRate = await fetchOfficialExchangeRate(this.currency, conversionDate);

        this.convertedAmountILS = this.totalAmount * exchangeRate;
        this.conversionRate = exchangeRate;
        this.conversionDate = conversionDate;

        console.log('Currency Conversion:', {
          originalAmount: this.totalAmount,
          currency: this.currency,
          exchangeRate: exchangeRate,
          convertedAmount: this.convertedAmountILS
        });
      } catch (error) {
        console.error('Conversion Error:', error);
        this.convertedAmountILS = this.totalAmount;
        this.conversionRate = 1;
      }
    }
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
    description: 'Invoice number for the expense'
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
  const correctMainCategory = getMainCategoryForSubcategory(this.subCategory);
  if (correctMainCategory && this.mainCategory !== correctMainCategory) {
    this.mainCategory = correctMainCategory;
  }
  
  if (!categorySubcategoryMap[this.mainCategory]?.includes(this.subCategory)) {
    return next(new Error(`Invalid subcategory "${this.subCategory}" for main category "${this.mainCategory}"`));
  }

  next();
});

baseExpenseSchema.pre('save', async function(next) {
  console.log('🔄 Pre-save hook started for expense');
  console.log('Original Expense Details:', {
    currency: this.currency,
    totalAmount: this.totalAmount,
    date: this.date,
    convertedAmountILS: this.convertedAmountILS,
    documentContext: {
      isNew: this.isNew,
      __v: this.__v,
      _id: this._id,
      expenseType: this.__t
    }
  });

  // Set totalAmount based on expense type
  if (this.__t === 'InvoiceExpense' && this.invoiceTotal) {
    this.totalAmount = this.invoiceTotal;
  } else if (this.__t === 'SalarySlipExpense' && this.grossSalary) {
    this.totalAmount = this.grossSalary;
  } else if (this.__t === 'ManualExpense' && this.manualTotalAmount) {
    this.totalAmount = this.manualTotalAmount;
  }

  // Validate totalAmount
  if (!this.totalAmount && this.totalAmount !== 0) {
    console.log('🚨 Validation Error: Total amount is undefined or null', {
      expense: this.toObject()
    });
    return next(new Error('Total amount must be provided'));
  }

  // Convert to ILS if needed
  if (this.currency !== 'ILS') {
    try {
      const rate = await fetchOfficialExchangeRate(this.currency, this.date);
      this.convertedAmountILS = this.totalAmount * rate;
    } catch (error) {
      console.error('Error converting to ILS:', error);
      return next(error);
    }
  } else {
    this.convertedAmountILS = this.totalAmount;
  }

  // Set timestamps
  if (this.isNew) {
    this.createdAt = new Date();
  }
  this.updatedAt = new Date();

  console.log('✅ Pre-save hook completed successfully:', {
    finalAmount: this.totalAmount,
    finalAmountILS: this.convertedAmountILS
  });

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