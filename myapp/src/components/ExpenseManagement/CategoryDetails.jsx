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

const CategoryDetailsPage = () => {
  const { year, month } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const categoryName = location.state?.categoryName || 'קטגוריה לא ידועה';
  const invoices = location.state?.invoices || [];

  const totalSum = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const hebrewMonth = new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(2024, parseInt(month) - 1));
  
  // Sort invoices by amount to find highest and lowest
  const sortedInvoices = [...invoices].sort((a, b) => b.totalAmount - a.totalAmount);
  const highestInvoice = sortedInvoices[0];
  const lowestInvoice = sortedInvoices[sortedInvoices.length - 1];

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
            title="סה״כ הוצאות"
            value={`₪${totalSum.toLocaleString()}`}
            subtext={`בחודש ${hebrewMonth}`}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={ReceiptIcon}
            title="מספר חשבוניות"
            value={invoices.length}
            subtext="חשבוניות בקטגוריה"
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUpIcon}
            title="הוצאה גבוהה ביותר"
            value={`₪${highestInvoice?.totalAmount.toLocaleString()}`}
            subtext={highestInvoice?.providerName}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingDownIcon}
            title="הוצאה נמוכה ביותר"
            value={`₪${lowestInvoice?.totalAmount.toLocaleString()}`}
            subtext={lowestInvoice?.providerName}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <Box p={3} display="flex" alignItems="center" gap={1}>
          <ReceiptIcon color="action" />
          <Typography variant="h6">פירוט חשבוניות</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>ספק</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>מספר חשבונית</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>סכום</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice, index) => (
                <TableRow 
                  key={index}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell align="right">
                    {new Date(invoice.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" gap={1}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography>{invoice.providerName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{invoice.invoiceId}</TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      ₪{invoice.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label="שולם"
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