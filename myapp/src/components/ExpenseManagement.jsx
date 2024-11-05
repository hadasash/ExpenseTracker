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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedMonth) return;
      
      setLoading(true);
      try {
        const data = await apiService.getInvoicesByMonth(year, selectedMonth);
        setInvoices(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch expense data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [selectedMonth, year]);

  const calculateTotals = () => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    const categoryTotals = invoices.reduce((acc, invoice) => {
      const category = invoice.category;
      acc[category] = (acc[category] || 0) + invoice.totalAmount;
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
            invoices={invoices}
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
        <ActionButtons onUpload={apiService.processInvoice} />
      </Box>
    </Container>
  );
};

export default ExpenseManagement;
