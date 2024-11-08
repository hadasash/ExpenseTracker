import React from 'react';
import { Typography, Box, LinearProgress, Paper, IconButton, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const categoryColors = {
  'Employee Salary': 'blue',
  'Marketing': 'green',
  'Office Supplies': 'orange',
  'Travel Expenses': 'purple',
  'Utilities': 'red',
  'food': 'brown',
  'Other': 'grey'
};

const CategoryBreakdown = ({ selectedMonth, year, categoryTotals, loading, invoices }) => {
  const { t } = useTranslation(); 
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCategoryClick = (year, month, categoryName) => {
    const filteredInvoices = invoices.filter(invoice => invoice.category === categoryName);
    navigate(`/${year}/${month}/details`, { state: { categoryName, invoices: filteredInvoices } });
  };

  // Find the highest amount for progress bar calculation
  const maxAmount = Math.max(...Object.values(categoryTotals));

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('expenseBreakdown')}</Typography> {/* תרגום הכותרת */}
        {[1, 2, 3, 4].map((index) => (
          <Skeleton key={index} height={80} sx={{ mb: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6">{t('expenseBreakdown')} - {t(selectedMonth)} {year}</Typography> {/* תרגום שם החודש */}
      <Box sx={{ mb: 4 }}>
        {Object.entries(categoryTotals).map(([category, amount], index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'translateY(-2px)',
              },
              borderRadius: 2,
            }}
            onClick={() => handleCategoryClick(year, selectedMonth, category)}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1,
            }}>
              <Typography 
                variant="subtitle1" 
                sx={{ fontWeight: 500, color: theme.palette.text.primary }}
              >
                {t(category) || category}  {/* תרגום שם הקטגוריה */}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  ₪{amount.toLocaleString()}
                </Typography>
                <IconButton size="small" sx={{ ml: 1, opacity: 0.7 }}>
                  <KeyboardArrowLeftIcon />
                </IconButton>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(amount / maxAmount) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: categoryColors[category] || theme.palette.primary.main,
                  borderRadius: 4,
                },
              }}
            />
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default CategoryBreakdown;
