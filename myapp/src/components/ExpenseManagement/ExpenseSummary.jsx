import React from 'react';
import { Typography,  Box  } from '@mui/material';

const ExpenseSummary = ({ selectedMonth, totalAmount, year }) => {
  const formattedAmount = totalAmount.toFixed(3);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="textSecondary">
          סיכום חודשי - {selectedMonth}/{year}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold',  }}>
        ₪{formattedAmount}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        סה"כ הוצאות חודשיות
      </Typography>
    </>
  );
};

export default ExpenseSummary;
