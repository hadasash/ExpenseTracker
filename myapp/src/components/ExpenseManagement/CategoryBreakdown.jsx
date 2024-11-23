import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const mainCategoryColors = {
  costOfRevenues: '#f44336', // Red
  generalExpenses: '#2196f3', // Blue
};

const CategoryBreakdown = ({ selectedMonth, year, expenses, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const calculateTotals = () => {
    const totals = {
      mainCategories: {},
      subCategories: {},
    };

    expenses.forEach((expense) => {
      const { mainCategory, subCategory, totalAmount } = expense;

      totals.mainCategories[mainCategory] =
        (totals.mainCategories[mainCategory] || 0) + totalAmount;

      totals.subCategories[subCategory] =
        (totals.subCategories[subCategory] || 0) + totalAmount;
    });

    return totals;
  };

  const { mainCategories, subCategories } = calculateTotals();

  const handleCategoryClick = (mainCategory, subCategory = null) => {
    const filteredExpenses = expenses.filter((expense) =>
      expense.mainCategory === mainCategory &&
      (!subCategory || expense.subCategory === subCategory)
    );

    navigate(`/${year}/${selectedMonth}/details`, {
      state: {
        mainCategory,
        subCategory,
        expenses: filteredExpenses,
      },
    });
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('expenseBreakdown')}
        </Typography>
        {[1, 2, 3, 4].map((index) => (
          <Paper key={index} sx={{ mb: 2, p: 2, height: 80 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t('expenseBreakdown')} - {t(selectedMonth)} {year}
      </Typography>

      {/* Main Categories */}
      {Object.entries(mainCategories).map(([mainCategory, amount]) => (
        <Box key={mainCategory} sx={{ mb: 3 }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              cursor: 'pointer',
              borderRadius: 2,
              borderLeft: `4px solid ${mainCategoryColors[mainCategory]}`,
              backgroundColor: theme.palette.background.paper,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
            onClick={() => handleCategoryClick(mainCategory)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {t(`categoryDetails.categories.${mainCategory}`)}
              </Typography>
              <Typography
                sx={{
                  color: mainCategoryColors[mainCategory], 
                }}
              >
                ₪{amount.toLocaleString()}
              </Typography>

            </Box>
          </Paper>

          {/* Subcategories */}
          <Box sx={{ pl: 2 }}>
            {Object.entries(subCategories)
              .filter(([subCategory]) => {
                const expense = expenses.find((e) => e.subCategory === subCategory);
                return expense?.mainCategory === mainCategory;
              })
              .map(([subCategory, subAmount]) => (
                <Paper
                  key={subCategory}
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2,
                    cursor: 'pointer',
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  onClick={() => handleCategoryClick(mainCategory, subCategory)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">{t(`categoryDetails.categories.${subCategory}`)}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ₪{subAmount.toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CategoryBreakdown;
