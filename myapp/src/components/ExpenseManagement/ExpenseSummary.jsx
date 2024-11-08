import React from 'react';
import { Typography, Paper } from '@mui/material';

const ExpenseSummary = ({ selectedMonth,totalAmount,year, }) => {

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6">סיכום חודשי - {selectedMonth} 2024</Typography>
      <Typography variant="h4">{totalAmount}</Typography> 
    </Paper>
  );
};

export default ExpenseSummary;
