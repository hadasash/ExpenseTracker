import axios from 'axios';

//const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default  {
  async getExpensesByDateRange(startDate, endDate) {

    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/expenses`, {
        params: { startDate, endDate },
    });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },
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

  deleteExpense: async (expenseId) => {
    // Validate input
    if (!expenseId) {
      throw new Error('Expense ID is required for deletion');
    }

    try {
      // Log the attempt for debugging
      console.log(`Attempting to delete expense with ID: ${expenseId}`);
      console.log('Full expense ID details:', {
        id: expenseId,
        type: typeof expenseId,
        length: expenseId.length
      });

      const response = await axios.delete(`${API_BASE_URL}/expenses/delete/${expenseId}`, {
        // Optional: Add headers or config if needed
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log successful deletion
      console.log(`Expense ${expenseId} deleted successfully`);
      console.log('Deletion response:', response.data);

      return response.data;
    } catch (error) {
      // Detailed error logging
      console.error('Delete expense error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });

      // Throw a more informative error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Failed to delete expense. Server responded with ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from server when trying to delete expense');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error setting up expense deletion request: ${error.message}`);
      }
    }
  },

  async addExpenseManually(payload) {
    try {
      const response = await axios.post(`${API_BASE_URL}/expenses/addExpenseManually`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async updateExpense(expenseId, updateData) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/expenses/${expenseId}`, updateData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Detailed error updating expense:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  },
};