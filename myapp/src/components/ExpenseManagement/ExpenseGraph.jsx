import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const subCategoryColors = {
  salariesAndRelated: '#D32F2F',  // אדום כהה
  commissions: '#F44336',  // אדום בהיר
  equipmentAndSoftware: '#FF5722',  // אדום כתום
  officeExpenses: '#E57373',  // אדום בהיר
  vehicleMaintenance: '#E53935',  // אדום כהה
  depreciation: '#C62828',  // אדום כהה יותר

  managementServices: '#1976D2',  // כחול כהה
  professionalServices: '#1565C0',  // כחול כהה יותר
  advertising: '#0288D1',  // כחול בהיר
  rentAndMaintenance: '#039BE5',  // כחול כהה
  postageAndCommunications: '#0288D1',  // כחול
  officeAndOther: '#1565C0',  // כחול כהה יותר
};

const CustomTooltip = ({ active, payload, t }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper 
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {t(`categoryDetails.categories.${data.name}`)}
        </Typography>
        <Typography variant="body2">{t('tooltip.amount')}: ₪{data.value.toLocaleString()}</Typography>
        <Typography variant="body2">{t('tooltip.percentage')}: {data.percentage}%</Typography>
      </Paper>
    );
  }
  return null;
};

const CustomLegend = ({ payload, isRTL, t }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isRTL ? 'flex-start' : 'flex-start', // Align text properly (always left for consistent appearance)
      gap: 1,
      marginRight: isRTL ? '0' : '16px', // Adjust margin for LTR and RTL
    }}
  >
    {payload.map((entry, index) => (
      <Box
        key={`item-${index}`}
        sx={{
          display: 'flex',
          flexDirection: 'row', // Always place icons and text in a row (icons on the right)
          alignItems: 'center',
          justifyContent: 'flex-end', // Ensures that icons are always on the right side
          gap: 1, // Space between icon and text
        }}
      >
        {/* Circle for the color */}
        <Box
          sx={{
            width: 12,
            height: 12,
            backgroundColor: entry.color,
            borderRadius: '50%', // Circle
          }}
        />
        {/* Text for the legend */}
        <Typography variant="body2" color="textPrimary">
          {t(`categoryDetails.categories.${entry.value}`)}
        </Typography>
      </Box>
    ))}
  </Box>
);

const ExpenseGraph = ({ expenses, loading }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);

  const subCategoryData = useMemo(() => {
    const subTotals = {};
    let totalAmount = 0;

    expenses.forEach((expense) => {
      const subAmount = expense.totalAmount || 0;
      totalAmount += subAmount;

      // Sub category totals
      subTotals[expense.subCategory] = (subTotals[expense.subCategory] || 0) + subAmount;
    });

    return Object.entries(subTotals)
      .map(([category, value]) => ({
        name: category,
        value,
        percentage: ((value / totalAmount) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (loading) {
    return (
      <Paper 
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          height: 400,
          width: '100%'
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t('loading')}
        </Typography>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={300} height={300} />
        </Box>
      </Paper>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Paper 
        elevation={3}
        sx={{
          p: 3,
          backgroundColor: 'white',
          borderRadius: 2,
          height: 400,
          width: '100%'
        }}
      >
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
          {t('noData')}
        </Typography>
      </Paper>
    );
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('graphTitle')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1, minHeight: 400 }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={subCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                innerRadius={75}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationDuration={1000}
              >
                {subCategoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={subCategoryColors[entry.name] || theme.palette.primary.main}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip t={t} />} />
              <Legend
                content={<CustomLegend payload={subCategoryData} isRTL={isRTL} t={t} />}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"  // Use circle icons for the legend
                iconSize={12}
                wrapperStyle={{
                  padding: '0 16px', // Add some padding to move the legend to the right
                  textAlign: isRTL ? 'right' : 'left', // Align text right or left based on language
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpenseGraph;
