import React from 'react';
import { Typography,  Box  } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ExpenseSummary = ({ selectedMonth, totalAmount, year }) => {
  const { t } = useTranslation();
  const formattedAmount = totalAmount.toFixed(3);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="textSecondary">
        {t('monthlySummary')}- {selectedMonth}/{year}
        </Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold',  }}>
        ₪{formattedAmount}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {t('monthlySummaryTitle')}
      </Typography>
    </>
  );
};

export default ExpenseSummary;
