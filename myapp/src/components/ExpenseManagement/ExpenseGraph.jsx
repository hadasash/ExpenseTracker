// import React, { useState, useMemo } from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Paper, Typography, Box, Skeleton, useTheme } from '@mui/material';

// const subCategoryColors = {
//   salariesAndRelated: '#42a5f5',
//   commissions: '#64b5f6',
//   equipmentAndSoftware: '#90caf9',
//   officeExpenses: '#bbdefb',
//   vehicleMaintenance: '#e3f2fd',
//   depreciation: '#1e88e5',
//   managementServices: '#ef5350',
//   professionalServices: '#e57373',
//   advertising: '#ef9a9a',
//   rentAndMaintenance: '#ffcdd2',
//   postageAndCommunications: '#ffebee',
//   officeAndOther: '#e53935',
// };

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <Box
//         sx={{
//           bgcolor: 'background.paper',
//           p: 1.5,
//           border: '1px solid',
//           borderColor: 'divider',
//           borderRadius: 1,
//           boxShadow: 1,
//         }}
//       >
//         <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
//           {data.name}
//         </Typography>
//         <Typography variant="body2">סכום: ₪{data.value.toLocaleString()}</Typography>
//         <Typography variant="body2">אחוז: {data.percentage}%</Typography>
//       </Box>
//     );
//   }
//   return null;
// };

// const ExpenseGraph = ({ expenses, loading }) => {
//   const theme = useTheme();
//   const [activeIndex, setActiveIndex] = useState(null);

//   const subCategoryData = useMemo(() => {
//     const subTotals = {};
//     let totalAmount = 0;

//     expenses.forEach((expense) => {
//       const subAmount = expense.totalAmount || 0;
//       totalAmount += subAmount;

//       // Sub category totals
//       subTotals[expense.subCategory] = (subTotals[expense.subCategory] || 0) + subAmount;
//     });

//     return Object.entries(subTotals)
//       .map(([category, value]) => ({
//         name: category,
//         value,
//         percentage: ((value / totalAmount) * 100).toFixed(1),
//       }))
//       .sort((a, b) => b.value - a.value);
//   }, [expenses]);

//   if (loading) {
//     return (
//       <Paper elevation={3} sx={{ p: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           התפלגות הוצאות לפי קטגוריה
//         </Typography>
//         <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <Skeleton variant="circular" width={300} height={300} />
//         </Box>
//       </Paper>
//     );
//   }

//   if (!expenses || expenses.length === 0) {
//     return (
//       <Paper elevation={3} sx={{ p: 3 }}>
//         <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
//           אין נתוני הוצאות זמינים לתקופה זו
//         </Typography>
//       </Paper>
//     );
//   }

//   const onPieEnter = (_, index) => {
//     setActiveIndex(index);
//   };

//   const onPieLeave = () => {
//     setActiveIndex(null);
//   };

//   return (
//     <Box>
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="h6" gutterBottom>
//           התפלגות הוצאות לפי קטגוריה
//         </Typography>
//       </Box>
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
//         <Box sx={{ flex: 1, minHeight: 400 }}>
//           <ResponsiveContainer width="100%" height={400}>
//             <PieChart>
//               <Pie
//                 data={subCategoryData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={false}
//                 outerRadius={150}
//                 innerRadius={75}
//                 fill="#8884d8"
//                 dataKey="value"
//                 onMouseEnter={onPieEnter}
//                 onMouseLeave={onPieLeave}
//                 animationDuration={1000}
//               >
//                 {subCategoryData.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={subCategoryColors[entry.name] || theme.palette.primary.main}
//                     stroke={theme.palette.background.paper}
//                     strokeWidth={2}
//                     style={{
//                       filter: activeIndex === index ? 'brightness(1.1)' : 'none',
//                       cursor: 'pointer',
//                     }}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip content={<CustomTooltip />} />
//               <Legend
//                 formatter={(value) => (
//                   <span style={{ color: theme.palette.text.primary }}>{value}</span>
//                 )}
//                 layout="vertical"
//                 align="right"
//                 verticalAlign="middle"
//               />
//             </PieChart>
//           </ResponsiveContainer>
//         </Box>
//       </Box>
//       </Box>
//   );
// };

// export default ExpenseGraph;
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
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {t(`subCategories.${data.name}`)}
        </Typography>
        <Typography variant="body2">{t('tooltip.amount')}: ₪{data.value.toLocaleString()}</Typography>
        <Typography variant="body2">{t('tooltip.percentage')}: {data.percentage}%</Typography>
      </Box>
    );
  }
  return null;
};

const ExpenseGraph = ({ expenses, loading }) => {
  const { t } = useTranslation();
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
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('loading.title')}
        </Typography>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={300} height={300} />
        </Box>
      </Paper>
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
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
          {t('title')}
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
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary }}>
                    {t(`categoryDetails.categories.${value}`)}
                  </span>
                )}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpenseGraph;
