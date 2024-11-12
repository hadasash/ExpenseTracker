import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Alert } from '@mui/material';
import YearTabs from './YearTabs';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGraph from './ExpenseGraph';
import CategoryBreakdown from './CategoryBreakdown';
import ActionButtons from './ActionButtons';
import { apiService } from '../services/apiService';

const ExpenseManagement = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(2024);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedMonth) return;
      
      setLoading(true);
      try {
        const data = await apiService.getExpensesByMonth(year, selectedMonth);
        setExpenses(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch expense data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [selectedMonth, year]);

  const calculateTotals = () => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
    
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.totalAmount;
      return acc;
    }, {});

    return { totalAmount, categoryTotals };
  };

  const { totalAmount, categoryTotals } = calculateTotals();

  return (
    <Container>
      <YearTabs
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        setYear={setYear}
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          <ExpenseSummary 
            selectedMonth={selectedMonth} 
            year={year}
            totalAmount={totalAmount}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ExpenseGraph 
            selectedMonth={selectedMonth} 
            year={year}
            expenses={expenses}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <CategoryBreakdown 
            selectedMonth={selectedMonth} 
            year={year}
            categoryTotals={categoryTotals}
            loading={loading}
          />
        </Grid>
      </Grid>
      
      <Box mt={2}>
        <ActionButtons onUpload={apiService.processExpense} />
      </Box>
    </Container>
  );
};

export default ExpenseManagement;
