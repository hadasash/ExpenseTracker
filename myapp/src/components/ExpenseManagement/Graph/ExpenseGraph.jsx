import React, { useState, useMemo } from 'react';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PieChartGraph from './PieChartGraph';

const ExpenseGraph = ({ expenses, loading }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [activeIndex, setActiveIndex] = useState(null);

  const subCategoryData = useMemo(() => {
    const subTotals = {};
    let totalAmount = 0;

    expenses.forEach((expense) => {
      const subAmount = expense.totalAmount || 0;
      totalAmount += subAmount;

      subTotals[expense.subCategory] = (subTotals[expense.subCategory] || 0) + subAmount;
    });

    return Object.entries(subTotals)
      .map(([category, value]) => ({
        name: category,
        value,
        percentage: ((value / totalAmount) * 100).toFixed(2),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, height: 400 }}>
        <Typography variant="h6" gutterBottom>{t('loading')}</Typography>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={300} height={300} />
        </Box>
      </Paper>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, height: 400 }}>
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
          {t('noData')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>{t('graphTitle')}</Typography>
      <PieChartGraph
        data={subCategoryData}
        t={t}
        isRTL={isRTL}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </Box>
  );
};

export default ExpenseGraph;
