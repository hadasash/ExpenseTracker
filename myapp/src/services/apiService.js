import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const apiService = {
  async getExpensesByMonth(year, month) {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/expenses`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Process new expense
  async processExpense(formData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/expenses/processExpenses`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error processing expense:', error);
      throw error;
    }
  },

  async deleteExpense(expenseId) {
    try {
      await axios.delete(`${API_BASE_URL}/expenses/delete_expense/${expenseId}`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};