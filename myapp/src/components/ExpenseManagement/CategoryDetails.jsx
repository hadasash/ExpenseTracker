import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  Divider,
  useMediaQuery,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// ICT theme colors
const ictColors = {
  primary: {
    main: '#1a237e', // Dark blue like in your AppBar
    light: '#534bae',
    dark: '#000051',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0d47a1',
    light: '#5472d3',
    dark: '#002171',
    contrastText: '#ffffff',
  }
};

const mainCategoryColors = {
  costOfRevenues: {
    light: '#E3F2FD',
    main: '#1565C0',
    dark: '#0D47A1',
    gradient: `linear-gradient(135deg, ${ictColors.primary.main} 0%, ${ictColors.secondary.main} 100%)`,
  },
  generalExpenses: {
    light: '#E8EAF6',
    main: '#3949AB',
    dark: '#1A237E',
    gradient: `linear-gradient(135deg, ${ictColors.secondary.main} 0%, ${ictColors.primary.main} 100%)`,
  },
};

const CategoryDetailsPage = () => {
  const { year, month } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mainCategory = location.state?.mainCategory;
  const subCategory = location.state?.subCategory;
  const expenses = location.state?.expenses || [];

  const totalSum = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const hebrewMonth = new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(year, parseInt(month) - 1));

  const sortedExpenses = [...expenses].sort((a, b) => b.totalAmount - a.totalAmount);
  const highestExpense = sortedExpenses[0];
  const lowestExpense = sortedExpenses[sortedExpenses.length - 1];

  const categoryColor = mainCategoryColors[mainCategory] || {
    light: ictColors.primary.light,
    main: ictColors.primary.main,
    dark: ictColors.primary.dark,
    gradient: `linear-gradient(135deg, ${ictColors.primary.main} 0%, ${ictColors.secondary.main} 100%)`,
  };

  const StatCard = ({ icon: Icon, title, value, subtext, color }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 2,
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          borderColor: 'transparent',
          '& .icon-box': {
            transform: 'scale(1.1)',
            backgroundColor: `${color}25`,
          },
        },
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box
          className="icon-box"
          sx={{
            width: 48,
            height: 48,
            backgroundColor: `${color}15`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </Box>
      <Box mt={2}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
          {subtext}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', mx: 'auto' }} dir="rtl">
      {/* Header Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: categoryColor.gradient,
          color: 'white',
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            justifyContent="space-between" 
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight="500" 
                mb={1.5}
                sx={{ letterSpacing: '-0.5px' }}
              >
                {t(mainCategory)}
              </Typography>
              {subCategory && (
                <Chip
                  icon={<CategoryIcon />}
                  label={t(subCategory)}
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    borderRadius: 1,
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    },
                  }}
                />
              )}
            </Box>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1.5} 
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                padding: '8px 16px',
              }}
            >
              <CalendarIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {`${hebrewMonth} ${year}`}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={WalletIcon}
            title={t('categoryDetails.totalExpenditure')}
            value={`₪${totalSum.toLocaleString()}`}
            subtext={`${hebrewMonth} ${year}`}
            color={ictColors.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ReceiptIcon}
            title={t('categoryDetails.expensesCount')}
            value={expenses.length}
            subtext={t('categoryDetails.expenseDetails')}
            color={ictColors.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUpIcon}
            title={t('categoryDetails.highestExpense')}
            value={`₪${highestExpense?.totalAmount?.toLocaleString() || 0}`}
            subtext={
              highestExpense?.expenseType === 'invoice'
                ? highestExpense?.providerName
                : highestExpense?.employeeName || t('categoryDetails.noExpense')
            }
            color={ictColors.primary.dark}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingDownIcon}
            title={t('categoryDetails.lowestExpense')}
            value={`₪${lowestExpense?.totalAmount?.toLocaleString() || 0}`}
            subtext={
              lowestExpense?.expenseType === 'invoice'
                ? lowestExpense?.providerName
                : lowestExpense?.employeeName || t('categoryDetails.noExpense')
            }
            color={ictColors.secondary.dark}
          />
        </Grid>
      </Grid>

      {/* Expenses Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
        }}
      >
        <Box 
          p={2} 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{ 
            backgroundColor: ictColors.primary.main,
            color: 'white'
          }}
        >
          <Typography variant="h6" fontWeight={500}>
            {t('categoryDetails.expenseDetails')}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              color: 'white',
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              }
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  align="right" 
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#f5f5f5',
                    color: ictColors.primary.main,
                  }}
                >
                  {t('categoryDetails.date')}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#f5f5f5',
                    color: ictColors.primary.main,
                  }}
                >
                  {t('categoryDetails.expenseType')}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#f5f5f5',
                    color: ictColors.primary.main,
                  }}
                >
                  {t('categoryDetails.provider')}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#f5f5f5',
                    color: ictColors.primary.main,
                  }}
                >
                  {t('categoryDetails.expenseId')}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: '#f5f5f5',
                    color: ictColors.primary.main,
                  }}
                >
                  {t('categoryDetails.amount')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#fafafa',
                    },
                    '&:hover': {
                      backgroundColor: `${ictColors.primary.light}10`,
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell align="right">
                    {new Date(expense.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={t(expense.expenseType)}
                      sx={{
                        backgroundColor: expense.expenseType === 'invoice' 
                          ? ictColors.primary.main 
                          : ictColors.secondary.main,
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {expense.expenseType === 'invoice' 
                      ? expense.providerName 
                      : expense.employeeName || t('categoryDetails.unknown')}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {expense.expenseType === 'invoice'
                      ? expense.invoiceId
                      : expense.salarySlipId || t('categoryDetails.unknown')}
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      fontWeight="600"
                      sx={{ 
                        color: ictColors.primary.main,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      ₪{expense.totalAmount.toLocaleString()}
                      <KeyboardArrowLeftIcon sx={{ opacity: 0.5, fontSize: 16 }} />
                    </Typography>
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