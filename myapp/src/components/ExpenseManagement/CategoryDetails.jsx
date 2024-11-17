import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const CategoryDetailsPage = () => {
  const { year, month } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation(); 

  const categoryName = location.state?.categoryName || t('categoryDetails.categoryName');
  const expenses = location.state?.expenses || [];

  const totalSum = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const hebrewMonth = new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(2024, parseInt(month) - 1));
  
  // Sort expenses by amount to find highest and lowest
  const sortedExpenses = [...expenses].sort((a, b) => b.totalAmount - a.totalAmount);
  const highestExpense = sortedExpenses[0];
  const lowestExpense = sortedExpenses[sortedExpenses.length - 1];

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Icon sx={{ color }} />
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtext}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }} dir="rtl">
      {/* Header Section */}
      <Box mb={6}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          {categoryName}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <CalendarIcon color="action" />
          <Typography variant="h6" color="text.secondary">
            {`${hebrewMonth} ${year}`}
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={WalletIcon}
            title={t('categoryDetails.totalExpenditure')}
            value={`₪${totalSum.toLocaleString()}`}
            subtext={`${t('January')} ${hebrewMonth}`} 
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ReceiptIcon}
            title={t('categoryDetails.expensesCount')}
            value={expenses.length}
            subtext={t('categoryDetails.expenseDetails')}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUpIcon}
            title={t('categoryDetails.highestExpense')}
            value={`₪${highestExpense?.totalAmount.toLocaleString()}`}
            subtext={highestExpense?.providerName}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingDownIcon}
            title={t('categoryDetails.lowestExpense')}
            value={`₪${lowestExpense?.totalAmount.toLocaleString()}`}
            subtext={lowestExpense?.providerName}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Expenses Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <Box p={3} display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="action" />
          <Typography variant="h6">{t('categoryDetails.expenseDetails')}</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categoryDetails.date')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categoryDetails.provider')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categoryDetails.expenseNumber')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categoryDetails.amount')}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('categoryDetails.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow 
                  key={index}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell align="right">
                    {new Date(expense.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography>{expense.providerName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{expense.expenseId}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      ₪{expense.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={t('categoryDetails.paid')}
                      size="small"
                      color="success"
                      sx={{ minWidth: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default CategoryDetailsPage;
