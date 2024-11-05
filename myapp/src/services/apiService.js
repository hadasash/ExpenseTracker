// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const apiService = {
  // Fetch invoices by year and month
  async getInvoicesByMonth(year, month) {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/invoices`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Process new invoice
  async processInvoice(formData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/invoices/processInvoices`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error processing invoice:', error);
      throw error;
    }
  },

  // Delete invoice
  async deleteInvoice(invoiceId) {
    try {
      await axios.delete(`${API_BASE_URL}/invoices/delete_invoice/${invoiceId}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};