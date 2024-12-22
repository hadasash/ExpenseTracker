import React from 'react';
import { Typography, Box, Paper, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const mainCategoryColors = {
  costOfRevenues: '#FFEBEE', // Light Red
  generalExpenses: '#E3F2FD', // Light Blue
};

const textColors = {
  costOfRevenues: '#D32F2F', // Darker Red
  generalExpenses: '#1976D2', // Darker Blue
};

const CategoryBreakdown = ({ selectedMonth, year, expenses, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = React.useState([]);

  const calculateTotals = () => {
    const totals = {
      mainCategories: {},
      subCategories: {},
    };

    // Detailed logging for debugging
    const expenseDetails = expenses.map(expense => ({
      mainCategory: expense.mainCategory,
      subCategory: expense.subCategory,
      totalAmount: expense.totalAmount,
      convertedAmountILS: expense.convertedAmountILS,
      currency: expense.currency
    }));
    console.group('Category Breakdown Totals');
    console.log('Expense Details:', expenseDetails);

    expenses.forEach((expense) => {
      const { mainCategory, subCategory } = expense;
      
      // Prioritize convertedAmountILS, fall back to totalAmount
      const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);

      totals.mainCategories[mainCategory] =
        (totals.mainCategories[mainCategory] || 0) + amount;

      totals.subCategories[subCategory] =
        (totals.subCategories[subCategory] || 0) + amount;
    });

    console.log('Main Category Totals:', totals.mainCategories);
    console.log('Sub Category Totals:', totals.subCategories);
    console.groupEnd();

    return totals;
  };

  const { mainCategories, subCategories } = calculateTotals();

  const handleCategoryClick = (mainCategory, subCategory = null) => {
    const filteredExpenses = expenses.filter(
      (expense) =>
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

  const toggleCategory = (mainCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(mainCategory)
        ? prev.filter((category) => category !== mainCategory)
        : [...prev, mainCategory]
    );
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
      <Typography variant="h6" color="textSecondary" sx={{ mb: 3 }}>
        {t('expenseBreakdown')} - {t(selectedMonth)}/{year}
      </Typography>

      {Object.entries(mainCategories).map(([mainCategory, amount]) => (
        <Box key={mainCategory} sx={{ mb: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: mainCategoryColors[mainCategory],
              cursor: 'pointer',
              '&:hover': { boxShadow: theme.shadows[4] },
            }}
            onClick={() => toggleCategory(mainCategory)}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t(`categoryDetails.categories.${mainCategory}`)}
              </Typography>
              <Typography variant="h6" sx={{ color: textColors[mainCategory] }}>
                ₪{amount.toLocaleString()}
              </Typography>
              <IconButton>
                {expandedCategories.includes(mainCategory) ? (
                  <ExpandLessIcon sx={{ color: textColors[mainCategory] }} />
                ) : (
                  <ExpandMoreIcon sx={{ color: textColors[mainCategory] }} />
                )}
              </IconButton>
            </Box>
          </Paper>

          {expandedCategories.includes(mainCategory) && (
            <Box sx={{ pl: 3, mt: 2, display: 'flex',
              flexDirection: 'column',   flexGrow: 1, }}>
              {Object.entries(subCategories)
                .filter(([subCategory]) => {
                  const expense = expenses.find(
                    (e) => e.subCategory === subCategory
                  );
                  return expense?.mainCategory === mainCategory;
                })
                .map(([subCategory, subAmount]) => (
                  <Paper
                    key={subCategory}
                    elevation={1}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                    onClick={() =>
                      handleCategoryClick(mainCategory, subCategory)
                    }
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body1">
                        {t(`categoryDetails.categories.${subCategory}`)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ₪{subAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CategoryBreakdown;