import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Paper, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  useTheme
} from '@mui/material';

const COLORS = [
  '#2196F3', // כחול
  '#4CAF50', // ירוק
  '#FFC107', // צהוב
  '#FF5722', // כתום
  '#9C27B0', // סגול
  '#F44336', // אדום
  '#3F51B5', // אינדיגו
  '#009688'  // טורקיז
];

const CustomTooltip = ({ active, payload }) => {
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
          {data.name}
        </Typography>
        <Typography variant="body2">
          Amount: ${data.value.toLocaleString()}
        </Typography>
        <Typography variant="body2">
          Percentage: {data.percentage}%
        </Typography>
      </Box>
    );
  }
  return null;
};

const ExpenseGraph = ({ categoryTotals, loading }) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(null);

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Expense Distribution by Category</Typography>
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton variant="circular" width={300} height={300} />
        </Box>
      </Paper>
    );
  }

  if (!categoryTotals || Object.keys(categoryTotals).length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
          No expense data available for this period.
        </Typography>
      </Paper>
    );
  }

  const data = Object.entries(categoryTotals)
    .map(([category, total], index) => ({
      name: category,
      value: total
    }))
    .sort((a, b) => b.value - a.value); // מיון לפי ערך יורד

  const totalAmount = data.reduce((sum, entry) => sum + entry.value, 0);

  const dataWithPercentages = data.map(entry => ({
    ...entry,
    percentage: ((entry.value / totalAmount) * 100).toFixed(1)
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // לא מציג תוויות קטנות מדי

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: '14px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Expense Distribution by Category
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1, minHeight: 400 }}>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                innerRadius={75} // הופך את הפאי לדונאט
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationDuration={1000}
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                    style={{
                      filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(value, entry) => (
                  <span style={{ color: theme.palette.text.primary }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        
      </Box>
    </Paper>
  );
};

export default ExpenseGraph;