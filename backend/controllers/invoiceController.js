require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
const invoicesModel = require("../models/invoicesModel"); 
const getInvoices = async (req, res) => {
    
    const { year, month } = req.query;
    console.log(year);
    console.log(month);

    try {
      const invoices = await invoicesModel.find({
        year: parseInt(year),
        month: parseInt(month)
      });
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching invoices', error: error.message });
    }
  };

const processInvoices = async (req, res) => {
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
                invoice: {
                  type: "object",
                  properties: {
                    invoiceId: {
                      type: "string",
                      description: "Unique identifier for the invoice"
                    },
                    providerName: {
                      type: "string",
                      description: ""
                    },
                    year: {
                      type: "integer",
                      description: "The year the invoice was issued"
                    },
                    month: {
                      type: "integer",
                      description: "The month the invoice was issued (1-12)"
                    },
                    totalAmount: {
                      type: "number",
                      description: "Total amount of the invoice"
                    },
                    category: {
                      type: "string",
                      description: "Category of the expense chosen from a predefined list",
                      enum: [
                        "Employee Salary",
                        "Marketing",
                        "Office Supplies",
                        "Travel Expenses",
                        "Utilities",
                        "food",
                        "Other"
                      ]
                    },
                    
                   
                   
                    details: {
                      type: "array",
                      description: "Detailed items listed on the invoice",
                      items: {
                        type: "object",
                        properties: {
                          itemName: {
                            type: "string",
                            description: "Name of the item"
                          },
                          itemCost: {
                            type: "number",
                            description: "Cost of the item"
                          },
                          quantity: {
                            type: "integer",
                            description: "Quantity of the item (if applicable)"
                          }
                        },
                        required: [
                          "itemName",
                          "itemCost"
                        ]
                      }
                    },
                 
                  },
                  required: [
                    "invoiceId",
                    "providerName",
                    "year",
                    "month",
                    "totalAmount",
                    "category",
                  ]
                }
              }
            },
          };
          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro-002",generationConfig:generationConfig
          });
        // Ensure files are present
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one file must be uploaded" });
        }

        let imageParts = [];
        // Save the uploaded files temporarily
        for (const file of req.files) {
            const filePath = saveUploadedFile(file);
            imageParts.push({ inlineData: { mimeType: file.mimetype, data: fs.readFileSync(filePath, { encoding: 'base64' }) } });
            uploadedPaths.push(filePath);
        }

        const prompt = " Extract key details";
        const generatedContent = await model.generateContent([prompt, ...imageParts]);
        const summary = generatedContent.response.text();
        const parsedSummary = JSON.parse(summary);
        console.log("summary", JSON.stringify(parsedSummary, null, 2));        
        // Save the parsed invoice data to MongoDB
        const invoiceData = parsedSummary.invoice;
        const newInvoice = new invoicesModel(invoiceData);
        await newInvoice.save(); 

        // Delete uploaded files after processing
        for (const filePath of uploadedPaths) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({ 
            message: "Invoices processed successfully", 
            summary: summary 
        });

    } catch (error) {
        console.error('Error processing invoices:', error);
        res.status(500).json({ 
            message: 'Error processing invoices', 
            error: error.message 
        });

        // Clean up files in case of error
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
    console.log("Saving file to:", filePath); // Debugging output

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

  const deleteInvoice = async (req, res) => {
    const { invoice_id } = req.params;
    try {
      res.status(204).send(); 
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ message: 'Error deleting invoice' });
    }
  };
  
  module.exports = {
    processInvoices,
    deleteInvoice,
    getInvoices,
  };
  