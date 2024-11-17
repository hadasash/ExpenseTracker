require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const { InvoiceExpenseModel, SalarySlipExpenseModel, BaseExpenseModel } = require("../models/expensesModel");

const getExpenses = async (req, res) => {

  const { year, month } = req.query;
  
  try {
      const expenses = await BaseExpenseModel.find({
          //year: parseInt(year),
          //month: parseInt(month)
      });
      console.log('Expenses:', expenses);
      
      if (expenses.length === 0) {
        return res.status(404).json({ message: 'No expenses found for the specified month and year.' });
      }
      
      res.json(expenses);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

const processExpenses = async (req, res) => {
    const uploadedPaths = [];

    try {
        const googleApiKey = process.env.GOOGLE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(googleApiKey);

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: {
                type: "object",
                properties: {
                    expense: {
                        type: "object",
                        properties: {
                            year: { type: "integer" },
                            month: { type: "integer" },
                            category: { type: "string", enum: ["Employee Salary", "Marketing", "Office Supplies", "Travel Expenses", "Utilities", "Food", "Other"] },
                            expenseType: { type: "string", enum: ["invoice", "salarySlip"] },
                            invoice: {
                                type: "object",
                                properties: {
                                    invoiceId: { type: "string" },
                                    providerName: { type: "string" },
                                    invoiceTotal: { type: "number" },
                                },
                                required: ["invoiceId", "providerName"]
                            },
                            salarySlip: {
                                type: "object",
                                properties: {
                                    employeeId: { type: "string" },
                                    employeeName: { type: "string" },
                                    employeeNumber: { type: "integer" },
                                    grossSalary: { type: "number" },
                                    netSalary: { type: "number" },
                                    department: { type: "string" }
                                },
                                required: ["employeeId", "employeeName", "grossSalary", "netSalary"]
                            }
                        },
                        required: ["year", "month", "category", "expenseType"]
                    }
                }
            }
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-002", generationConfig: generationConfig
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one file must be uploaded" });
        }

        let imageParts = [];
        for (const file of req.files) {
            const filePath = saveUploadedFile(file);
            imageParts.push({ inlineData: { mimeType: file.mimetype, data: fs.readFileSync(filePath, { encoding: 'base64' }) } });
            uploadedPaths.push(filePath);
        }

        const prompt = "Extract key details";
        const generatedContent = await model.generateContent([prompt, ...imageParts]);
        const summary = generatedContent.response.text();
        const parsedSummary = JSON.parse(summary);
        console.log("summary", JSON.stringify(parsedSummary, null, 2));
        const expenseData = parsedSummary.expense;

        if (expenseData.expenseType === 'invoice') {
            if (!expenseData.invoice || !expenseData.invoice.invoiceId || !expenseData.invoice.providerName) {
                return res.status(400).json({ message: "Missing required invoice fields" });
            }
            const invoiceData = {
                ...expenseData,
                ...expenseData.invoice
            };
        
            console.log('Flattened Invoice Data:', invoiceData);
        
            const newExpense = new InvoiceExpenseModel(invoiceData);
            await newExpense.save();

        } else if (expenseData.expenseType === 'salarySlip') {            
            if (!expenseData.salarySlip || !expenseData.salarySlip.employeeId || !expenseData.salarySlip.grossSalary || !expenseData.salarySlip.netSalary) {
                return res.status(400).json({ message: "Missing required salary slip fields" });
            }

            const salarySlipData = {
                ...expenseData,
                ...expenseData.salarySlip
            };
        
            console.log('Flattened Salary Slip Data:', salarySlipData);
        
            const newExpense = new SalarySlipExpenseModel(salarySlipData);
            await newExpense.save();

        } else {
            return res.status(400).json({ message: "Invalid expense type detected" });
        }
        // Delete uploaded files after processing
        for (const filePath of uploadedPaths) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            message: "Expenses processed successfully",
            summary: summary
        });

    } catch (error) {
        console.error('Error processing expenses:', error);
        res.status(500).json({
            message: 'Error processing expenses',
            error: error.message
        });

        for (const filePath of uploadedPaths) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error(`Error deleting file ${filePath}:`, err);
            }
        }
    }
};

const saveUploadedFile = (file) => {
    const uploadFolder = path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadFolder, { recursive: true });

    const filePath = path.join(uploadFolder, file.originalname);
    console.log("Saving file to:", filePath);

    if (!file.buffer || file.buffer.length === 0) {
        console.log("File buffer is empty for:", file.originalname);
    } else {
        try {
            fs.writeFileSync(filePath, file.buffer);
            console.log("File saved successfully:", file.originalname);
        } catch (err) {
            console.error("Error writing file:", err);
        }
    }

    return filePath;
};

const deleteExpense = async (req, res) => {
    const { expense_id } = req.params;
    try {
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense:', error, expense_id);
        res.status(500).json({ message: 'Error deleting expense' });
    }
};

module.exports = {
    processExpenses,
    deleteExpense,
    getExpenses,
};
