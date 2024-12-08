const { InvoiceExpenseModel, SalarySlipExpenseModel, ManualExpenseModel, BaseExpenseModel } = require("../models/expensesModel");
const { getAIModel } = require('../config/ai');
const path = require('path');
const fs = require('fs').promises;

class ExpenseService {
  static async getExpensesByDateRange(startDate, endDate) {
    return await BaseExpenseModel.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });
  }

  static async saveUploadedFile(file) {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, file.originalname);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  static cleanProviderName(providerName) {
    return providerName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  static createUniqueInvoiceId(invoiceNumber, providerName) {
    const cleanProvider = this.cleanProviderName(providerName);
    return `${cleanProvider}_${invoiceNumber}`;
  }

  static createUniqueSalarySlipId(employeeId, date, grossSalary) {
    return `${employeeId}_${date}_${grossSalary}`;
  }

  static async processExpenseFiles(files) {
    const model = getAIModel();
    const uploadedPaths = [];
    const results = [];

    try {
      for (const file of files) {
        const filePath = await this.saveUploadedFile(file);
        uploadedPaths.push(filePath);
        
        const fileContent = await fs.readFile(filePath, { encoding: 'base64' });
        const prompt = `Extract expense information from this document. The document is a ${file.mimetype} file.`;
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: file.mimetype,
              data: fileContent
            }
          }
        ]);

        const response = await result.response;
        const parsedResponse = JSON.parse(response.text());
        results.push(parsedResponse);
      }

      return results;
    } finally {
      // Cleanup uploaded files
      for (const filePath of uploadedPaths) {
        await fs.unlink(filePath).catch(console.error);
      }
    }
  }

  static async deleteExpense(expenseId) {
    const expense = await BaseExpenseModel.findById(expenseId);
    if (!expense) {
      throw new Error('Expense not found');
    }
    await expense.deleteOne();
    return { message: 'Expense deleted successfully' };
  }

  static async updateExpense(expenseId, updateData) {
    if (!expenseId) {
      throw new Error('Expense ID is required');
    }

    const { intervalEndDate, ...restData } = updateData;
    
    const processedData = {
      ...restData,
      intervalEnd: intervalEndDate ? new Date(intervalEndDate) : null,
      updatedAt: new Date()
    };

    const updatedExpense = await BaseExpenseModel.findByIdAndUpdate(
      expenseId,
      processedData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedExpense) {
      throw new Error('Expense not found');
    }

    return updatedExpense;
  }

  static async addExpenseManually(expenseData) {
    const { expenseType, ...data } = expenseData;
    let expense;

    switch (expenseType) {
      case 'invoice':
        const invoiceId = this.createUniqueInvoiceId(
          data.invoice.invoiceNumber,
          data.providerName
        );
        expense = new InvoiceExpenseModel({ ...data, invoiceId });
        break;

      case 'salarySlip':
        const salarySlipId = this.createUniqueSalarySlipId(
          data.salarySlip.employeeId,
          data.date,
          data.salarySlip.grossSalary
        );
        expense = new SalarySlipExpenseModel({ ...data, salarySlipId });
        break;

      default:
        expense = new ManualExpenseModel(data);
    }

    await expense.save();
    return expense;
  }
}

module.exports = ExpenseService;
