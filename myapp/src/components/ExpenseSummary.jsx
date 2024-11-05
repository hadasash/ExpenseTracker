import React from 'react';
import { Typography, Paper } from '@mui/material';

const ExpenseSummary = ({ selectedMonth }) => {
  const monthName = selectedMonth 

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6">סיכום חודשי - {monthName} 2024</Typography>
      <Typography variant="h4">₪100,500</Typography> 
    </Paper>
  );
};

export default ExpenseSummary;
