
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
  Chip,
  IconButton,
  Stack,
  Paper,
  useMediaQuery,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  Download as DownloadIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Modern color theme
const theme = {
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f172a',
      light: '#1e293b',
      dark: '#0f172a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
};

const CategoryDetailsPage = () => {
  const { year, month } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const mainCategory = location.state?.mainCategory;
  const subCategory = location.state?.subCategory;
  const expenses = location.state?.expenses || [];

  const totalSum = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const hebrewMonth = new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(year, parseInt(month) - 1));

  const StatCard = ({ icon: Icon, title, value, subtitle }) => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100vh' }} dir="rtl">
      {/* Header Card */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          background: theme.palette.primary.main,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems={isMobile ? 'flex-start' : 'center'}
            spacing={2}
          >
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight="700"
                color="white"
                gutterBottom
              >
                {t(mainCategory)}
              </Typography>
              {subCategory && (
                <Chip
                  icon={<CategoryIcon sx={{ color: 'white !important' }} />}
                  label={t(subCategory)}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                  }}
                />
              )}
            </Box>
            <Chip
              icon={<CalendarIcon sx={{ color: 'white !important' }} />}
              label={`${hebrewMonth} ${year}`}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <StatCard
            icon={WalletIcon}
            title="סך הכל הוצאות"
            value={`₪${totalSum.toLocaleString()}`}
            subtitle={`${hebrewMonth} ${year}`}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            icon={ReceiptIcon}
            title="מספר חשבוניות"
            value={expenses.length}
            subtitle="סך הכל חשבוניות לתקופה זו"
          />
        </Grid>
      </Grid>

      {/* Expenses Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" fontWeight="600">
            {t('categoryDetails.expenseDetails')}
          </Typography>
          <IconButton
            size="small"
            sx={{
              '&:hover': {
                bgcolor: `${theme.palette.primary.main}20`,
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['date', 'expenseType', 'provider', 'expenseId', 'amount'].map((header) => (
                  <TableCell
                    key={header}
                    align="right"
                    sx={{
                      fontWeight: 600,
                      bgcolor: 'background.default',
                    }}
                  >
                    {t(`categoryDetails.${header}`)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': {
                      bgcolor: `${theme.palette.primary.main}05`,
                    },
                  }}
                >
                  <TableCell align="right">
                    {new Date(expense.date).toLocaleDateString( {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={t(expense.expenseType)}
                      size="small"
                      sx={{
                        bgcolor: expense.expenseType === 'invoice'
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                        color: 'white',
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
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      justifyContent="flex-end"
                      sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
                    >
                      <Typography>₪{expense.totalAmount.toLocaleString()}</Typography>
                      <KeyboardArrowLeftIcon sx={{ opacity: 0.5, fontSize: 16 }} />
                    </Stack>
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