import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';


// Styled components for enhanced visual appeal
const WelcomeCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  }
}));

const MonthlyExpensesCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = currentDate;

        const expenses = await apiService.getExpensesByDateRange(
          startOfMonth.toISOString(), 
          endOfMonth.toISOString()
        );

        const total = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

        setMonthlyExpenses(total);
      } catch (error) {
        console.error('Failed to fetch monthly expenses', error);
      }
    };

    fetchExpenses();
  }, []);

  const quickActions = [
    {
      title: t('homePage.manageExpenses'),
      description: t('homePage.manageExpensesDescription'),
      icon: <MonetizationOnIcon fontSize="large" color="primary" />,
      link: '/expenses'
    },
    {
      title: t('homePage.uploadDocument'),
      description: t('homePage.uploadDocumentDescription'),
      icon: <ReceiptIcon fontSize="large" color="secondary" />,
      link: '/upload'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12} md={4}>
          <WelcomeCard>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {t('homePage.welcome')}
              </Typography>
              <Typography variant="subtitle1">
                {t('homePage.welcomeSubtitle')}
              </Typography>
            </CardContent>
          </WelcomeCard>
        </Grid>

        {/* Monthly Expenses Card */}
        <Grid item xs={12} md={4}>
          <MonthlyExpensesCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('homePage.monthlyExpenses')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ₪{monthlyExpenses.toLocaleString()}
              </Typography>
            </CardContent>
          </MonthlyExpensesCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('homePage.quickActions')}
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} key={index}>
                <QuickActionCard>
                  <CardActionArea 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                    onClick={() => navigate(action.link)}
                  >
                    {action.icon}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">{action.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </QuickActionCard>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
