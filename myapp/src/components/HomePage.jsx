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
  Container,
  Paper,
  IconButton,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import apiService from '../services/apiService';

// Styled components for enhanced visual appeal
const GradientCard = styled(Card)(({ theme }) => ({
  // background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.common.white,
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
  }
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  }
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(2),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
}));

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
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
      icon: <MonetizationOnIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      link: '/expenses',
      color: theme.palette.primary.main
    },
    {
      title: t('homePage.uploadDocument'),
      description: t('homePage.uploadDocumentDescription'),
      icon: <ReceiptIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />,
      link: '/upload',
      color: theme.palette.secondary.main
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%)',
      pt: 4,
      pb: 8
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                mb: 4
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {t('homePage.welcome')}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px' }}>
                {t('homePage.welcomeSubtitle')}
              </Typography>
            </Paper>
          </Grid>

          {/* Monthly Expenses Card */}
          <Grid item xs={12} md={6}>
            <GradientCard>
              <CardContent sx={{ p: 4 }}>
                {/* <StyledIconButton>
                  <TrendingUpIcon />
                </StyledIconButton> */}
                <Typography variant="h6" sx={{ mb: 1, opacity: 0.9 }}>
                  {t('homePage.monthlyExpenses')}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  ₪{monthlyExpenses.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                </Typography>
              </CardContent>
            </GradientCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              {t('homePage.quickActions')}
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} key={index}>
                  <QuickActionCard>
                    <CardActionArea 
                      onClick={() => navigate(action.link)}
                      sx={{ 
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <Box 
                        sx={{ 
                          mr: 3,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: `${action.color}15`
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {action.title}
                        </Typography>
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
    </Box>
  );
};

export default HomePage;
