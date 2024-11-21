require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const { InvoiceExpenseModel, SalarySlipExpenseModel, BaseExpenseModel } = require("../models/expensesModel");

const getExpenses = async (req, res) => {

  const { year, month } = req.query;
  
  try {
      const expenses = await BaseExpenseModel.find({
          year: parseInt(year),
          month: parseInt(month)
      });
      
      res.status(200).json(expenses);
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
                    expenses: {
                        type: "array",
                        items: {
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
                                        invoiceNumber: { type: "number" },
                                        providerName: { type: "string" },
                                        invoiceTotal: { type: "number" },
                                    },
                                    required: ["invoiceNumber", "providerName"]
                                },
                                salarySlip: {
                                    type: "object",
                                    properties: {
                                        employeeId: { type: "string" },
                                        employeeName: { type: "string" },
                                        employeeNumber: { type: "integer" },
                                        grossSalary: { type: "number" },
                                        netSalary: { type: "number" },
                                        companyName: { type: "string" },
                                    },
                                    required: ["employeeId", "employeeName", "grossSalary", "netSalary"]
                                }
                            },
                            required: ["year", "month", "category", "expenseType"]
                        }
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

        const prompt = "Extract key details for all expenses";
        const generatedContent = await model.generateContent([prompt, ...imageParts]);
        const summary = generatedContent.response.text();
        const parsedSummary = JSON.parse(summary);
        const expenses = parsedSummary.expenses;

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return res.status(400).json({ message: "No valid expense data found" });
        }

        const savedExpenses = [];

        for (const expenseData of expenses) {
            if (expenseData.expenseType === 'invoice') {
                if (!expenseData.invoice || !expenseData.invoice.invoiceNumber || !expenseData.invoice.providerName) {
                    return res.status(400).json({ message: "Missing required invoice fields" });
                }

                const uniqueInvoiceId = createUniqueInvoiceId(
                    expenseData.invoice.invoiceNumber, 
                    expenseData.invoice.providerName,
                );

                expenseData.invoice.invoiceId = uniqueInvoiceId;

                const existingInvoice = await InvoiceExpenseModel.findOne({ invoiceId: uniqueInvoiceId });
                if (existingInvoice) {
                    return res.status(400).json({ message: 'Invoice already exists:', uniqueInvoiceId });
                }

                const invoiceData = {
                    ...expenseData,
                    ...expenseData.invoice
                };

                const newExpense = new InvoiceExpenseModel(invoiceData);
                await newExpense.save();
                savedExpenses.push(newExpense);

            } else if (expenseData.expenseType === 'salarySlip') {
                if (!expenseData.salarySlip || !expenseData.salarySlip.employeeId || !expenseData.salarySlip.grossSalary || !expenseData.salarySlip.netSalary) {
                    return res.status(400).json({ message: "Missing required salary slip fields" });
                }

                const uniqueSalarySlipId = createUniqueSalarySlipId(
                    expenseData.salarySlip.employeeId, 
                    expenseData.year,
                    expenseData.month,
                    expenseData.salarySlip.grossSalary,
                );                

                expenseData.salarySlip.salarySlipId = uniqueSalarySlipId;

                const existingSalarySlip = await SalarySlipExpenseModel.findOne({ salarySlipId: uniqueSalarySlipId });
                
                if (existingSalarySlip) {
                    return res.status(400).json({ message: 'Salary slip already exists:', uniqueSalarySlipId });
                }

                const salarySlipData = {
                    ...expenseData,
                    ...expenseData.salarySlip
                };

                const newExpense = new SalarySlipExpenseModel(salarySlipData);
                await newExpense.save();
                savedExpenses.push(newExpense);

            } else {
                return res.status(400).json({ message: "Invalid expense type detected" });
            }
        }

        // Delete uploaded files after processing
        for (const filePath of uploadedPaths) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            message: "Expenses processed successfully",
            savedExpenses
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
    const { _id } = req.params;
    try {
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense:', error, _id);
        res.status(500).json({ message: 'Error deleting expense' });
    }
};

const cleanCompanyName = (companyName) => {
    return companyName
        .replace(/[^\w\s\-\u0590-\u05FF]/g, '') // Remove all characters except alphanumeric, spaces, hyphens, and Hebrew letters
        .replace(/\./g, '-')   // Replace periods with hyphens
        .toLowerCase();        // Optional: Convert to lowercase for consistency
};

const createUniqueInvoiceId = (invoiceNumber, companyName) => {
    const sanitizedCompanyName = cleanCompanyName(companyName);    
    return `${invoiceNumber}-${sanitizedCompanyName}`;
};

const createUniqueSalarySlipId = (employeeId, month, year, grossSalary) => {
    return `${employeeId}-${month}-${year}-${grossSalary}`;
};

module.exports = {
    processExpenses,
    deleteExpense,
    getExpenses,
};
