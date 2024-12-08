require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const aiConfig = {
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: "gemini-1.5-pro-002",
  generationConfig: {
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
  }
};

const getAIModel = () => {
  const genAI = new GoogleGenerativeAI(aiConfig.apiKey);
  return genAI.getGenerativeModel({
    model: aiConfig.model,
    generationConfig: aiConfig.generationConfig
  });
};

module.exports = {
  aiConfig,
  getAIModel
};
