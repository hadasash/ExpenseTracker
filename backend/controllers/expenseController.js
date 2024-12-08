require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const { InvoiceExpenseModel, SalarySlipExpenseModel, ManualExpenseModel, BaseExpenseModel } = require("../models/expensesModel");
const ExpenseService = require('../services/expenseService'); // Import the ExpenseService

const getExpenses = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const expenses = await BaseExpenseModel.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });
        res.status(200).json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};


const processExpenses = async (req, res) => {
    const uploadedPaths = [];

    try {
        const googleApiKey = process.env.GOOGLE_AI_API_KEY;
        const genAI = new GoogleGenerativeAI(googleApiKey);
        console.log("hello");

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
                                date: { type: "string" },
                                mainCategory: {
                                    type: "string",
                                    enum: ["costOfRevenues", "generalExpenses"]
                                },
                                subCategory: {
                                    type: "string",
                                    enum: [
                                        "salariesAndRelated",
                                        "commissions",
                                        "equipmentAndSoftware",
                                        "officeExpenses",
                                        "vehicleMaintenance",
                                        "depreciation",
                                        "managementServices",
                                        "professionalServices",
                                        "advertising",
                                        "rentAndMaintenance",
                                        "postageAndCommunications",
                                        "officeAndOther"
                                    ]
                                },
                                expenseType: {
                                    type: "string",
                                    enum: ["invoice", "salarySlip"]
                                },
                                providerName: { type: "string" },
                                currency: { type: "string" },
                                invoice: {
                                    type: "object",
                                    properties: {
                                        invoiceId: { type: "string" },
                                        invoiceNumber: { type: "number" },
                                        invoiceTotal: { type: "number" },
                                    },
                                    required: ["invoiceNumber"]
                                },
                                salarySlip: {
                                    type: "object",
                                    properties: {
                                        employeeId: { type: "string" },
                                        employeeName: { type: "string" },
                                        employeeNumber: { type: "integer" },
                                        grossSalary: { type: "number" },
                                        netSalary: { type: "number" },
                                    },
                                    required: ["employeeId", "employeeName", "grossSalary", "netSalary"]
                                }
                            },
                            required: ["date", "mainCategory", "subCategory", "expenseType", "providerName"]
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

        const prompt = `
            Extract key details for all expenses:
            - Ensure that the date values are in the format "yyyy-mm-ddT00:00:00Z". When no day is provided, use the first day of the month.
            - Ensure all currency values are returned using ISO currency codes (e.g., use "USD" instead of "$", "ILS" instead of "₪").
            - Ensure date equals the invoice date or the salary slip date and not the range in which the expense was incurred.
            `;
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
                if (!expenseData.invoice || !expenseData.invoice.invoiceNumber || !expenseData.providerName) {
                    return res.status(400).json({ message: "Missing required invoice fields" });
                }

                const uniqueInvoiceId = createUniqueInvoiceId(
                    expenseData.invoice.invoiceNumber, 
                    expenseData.providerName,
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
                    expenseData.date,
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
                console.error(`Error deleting file ${ filePath }: `, err);
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
    const { expenseId } = req.params;
    
    console.log('Received delete request for expense ID:', expenseId);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    try {
        // Attempt to delete from all possible expense models
        const models = [
            { name: 'InvoiceExpenseModel', model: InvoiceExpenseModel },
            { name: 'SalarySlipExpenseModel', model: SalarySlipExpenseModel },
            { name: 'ManualExpenseModel', model: ManualExpenseModel },
            { name: 'BaseExpenseModel', model: BaseExpenseModel }
        ];

        let deletedExpense = null;
        for (const { name, model } of models) {
            console.log(`Attempting to delete from ${name} with ID: ${expenseId}`);
            
            try {
                // Try finding the document first to log its details
                const foundDocument = await model.findById(expenseId);
                console.log(`Found document in ${name}:`, foundDocument);

                if (foundDocument) {
                    deletedExpense = await model.findByIdAndDelete(expenseId);
                    
                    if (deletedExpense) {
                        console.log(`Successfully deleted expense from ${name}`);
                        break;
                    }
                }
            } catch (modelError) {
                console.error(`Error deleting from ${name}:`, modelError);
            }
        }

        if (!deletedExpense) {
            console.log(`No expense found with ID: ${expenseId} in any model`);
            return res.status(404).json({ 
                message: 'Expense not found', 
                expenseId: expenseId,
                searchedModels: models.map(m => m.name)
            });
        }

        console.log(`Expense ${expenseId} deleted successfully`);
        res.status(200).json({ 
            message: 'Expense deleted successfully', 
            deletedExpense: deletedExpense 
        });
    } catch (error) {
        console.error('Unexpected error deleting expense:', error);
        res.status(500).json({ 
            message: 'Error deleting expense', 
            error: error.message,
            stack: error.stack
        });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedExpense = await ExpenseService.updateExpense(id, updateData);

        res.status(200).json({
            message: 'Expense updated successfully',
            success: true,
            expense: updatedExpense
        });

    } catch (error) {
        console.error('Error updating expense:', error);
        
        // Handle specific mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Invalid expense update',
                success: false,
                errors: error.errors
            });
        }

        // Handle not found error
        if (error.message === 'Expense not found') {
            return res.status(404).json({
                message: error.message,
                success: false
            });
        }

        // Handle missing ID error
        if (error.message === 'Expense ID is required') {
            return res.status(400).json({
                message: error.message,
                success: false
            });
        }

        // Generic server error
        res.status(500).json({ 
            message: 'Server error updating expense',
            success: false,
            error: error.message 
        });
    }
};

const cleanProviderName = (providerName) => {
    return providerName
        .replace(/[^\w\s\-\u0590-\u05FF]/g, '') // Removes special characters
        .replace(/\s+/g, '-')  // Replaces spaces with hyphens
        .replace(/\./g, '-')   // Replaces periods with hyphens
        .toLowerCase();        // Converts to lowercase
};

const createUniqueInvoiceId = (invoiceNumber, providerName) => {
    const sanitizedProviderName = cleanProviderName(providerName);    
    return `${invoiceNumber}-${sanitizedProviderName}`;
};

const createUniqueSalarySlipId = (employeeId, date, grossSalary) => {
    const formattedDate = date.slice(0, 7); // Extracts "yyyy-mm"
    return `${employeeId}-${formattedDate}-${grossSalary}`;
};

const addExpenseManually = async (req, res) => {
    try {
        const {
            date,
            category,
            subCategory,
            providerName,
            manualInterval,
            intervalEndDate,
            manualTotalAmount,
            note,
            currency = 'ILS'  // Default to ILS if not specified
        } = req.body;

        if (!date || !category || !subCategory || !providerName || manualTotalAmount <= 0) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const validIntervals = ['monthly', 'yearly'];
        if (manualInterval && !validIntervals.includes(manualInterval)) {
            return res.status(400).json({ message: 'Invalid manual interval. Allowed values are "monthly", or "yearly"' });
        }

        const formattedDate = new Date(date);
        
        let intervalEnd;
        if (manualInterval && !intervalEndDate) {
            intervalEnd = new Date(formattedDate);
            intervalEnd.setFullYear(intervalEnd.getFullYear() + 2);
        } else {
            intervalEnd = intervalEndDate ? new Date(intervalEndDate) : null;
        }

        const baseExpenseData = {
            date: formattedDate,
            mainCategory: category,
            subCategory: subCategory,
            providerName: providerName,
            manualInterval: manualInterval,
            intervalEndDate: intervalEnd,
            totalAmount: manualTotalAmount,
            currency: currency,
            note: note || '',
            expenseType: 'manual',
        };

        // If no interval is specified, just save the single expense
        if (!manualInterval) {
            const newExpense = new ManualExpenseModel(baseExpenseData);
            
            // Perform currency conversion if needed
            if (currency !== 'ILS') {
                await newExpense.convertToILS();
            } else {
                newExpense.convertedAmountILS = manualTotalAmount;
                newExpense.conversionRate = 1;
            }
            
            await newExpense.save();
            return res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
        }

        // Create recurring expenses
        const expenses = [];
        let currentDate = new Date(formattedDate);

        while (currentDate <= intervalEnd) {
            const expenseData = {
                ...baseExpenseData,
                date: new Date(currentDate)
            };

            const newExpense = new ManualExpenseModel(expenseData);
            
            // Perform currency conversion if needed
            if (currency !== 'ILS') {
                await newExpense.convertToILS();
            } else {
                newExpense.convertedAmountILS = manualTotalAmount;
                newExpense.conversionRate = 1;
            }
            
            await newExpense.save();
            expenses.push(newExpense);

            if (manualInterval === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (manualInterval === 'yearly') {
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
        }

        res.status(201).json({ 
            message: 'Recurring expenses added successfully', 
            expenseCount: expenses.length,
            expenses: expenses,
            automaticEndDate: intervalEnd
        });

    } catch (error) {
        console.error('Error adding expense manually:', error);
        res.status(500).json({ message: 'Failed to add the expense', error: error.message });
    }
};

module.exports = {
    processExpenses,
    addExpenseManually,
    deleteExpense,
    getExpenses,
    updateExpense,
};
