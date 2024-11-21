import React from 'react';
import { Typography, Paper,Box } from '@mui/material';

const ExpenseSummary = ({ selectedMonth, totalAmount, year }) => {
  const formattedAmount = totalAmount.toFixed(3);

  return (
    <Box>
      <Typography variant="h6">סיכום חודשי - {selectedMonth}/{year}</Typography>
      <Typography variant="h4">₪{formattedAmount}</Typography> 
    </Box>
      
  );
};

export default ExpenseSummary;
