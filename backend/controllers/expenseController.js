require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const { InvoiceExpenseModel, SalarySlipExpenseModel, ManualExpenseModel, BaseExpenseModel } = require("../models/expensesModel");

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
    const { _id } = req.params;
    try {
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting expense:', error, _id);
        res.status(500).json({ message: 'Error deleting expense' });
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
        } = req.body;

        if (!date || !category || !subCategory || !providerName || manualTotalAmount <= 0) {
            return res.status(400).json({ message: 'Missing or invalid required fields' });
        }

        const validIntervals = ['monthly', 'yearly'];
        if (!validIntervals.includes(manualInterval)) {
            return res.status(400).json({ message: 'Invalid manual interval. Allowed values are "monthly", or "yearly"' });
        }

        const formattedDate = new Date(date);

        const expenseData = {
            date: formattedDate,
            mainCategory: category,
            subCategory: subCategory,
            providerName: providerName,
            manualInterval: manualInterval,
            intervalEndDate: intervalEndDate,
            manualTotalAmount: manualTotalAmount,
            note: note || '',
            currency: 'ILS',
            expenseType: 'manual',
        };

        const newExpense = new ManualExpenseModel(expenseData);
        await newExpense.save();

        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
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
};
