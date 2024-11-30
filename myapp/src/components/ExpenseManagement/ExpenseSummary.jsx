import React from 'react';
import { Typography,  Box  } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ExpenseSummary = ({ selectedMonth, totalAmount, year }) => {
  const { t } = useTranslation();
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(totalAmount);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="textSecondary">
        {t('monthlySummaryTitle')} - {selectedMonth}/{year}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold',  }}>
        ₪{formattedAmount}
      </Typography>
    </>
  );
};

export default ExpenseSummary;
