import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { blue, teal, grey } from '@mui/material/colors';
import i18n from './utils/i18n'; 
import AppBar from './components/AppBar';
import FileUpload from './components/FileUpload/FileUpload';
import ExpenseManagement from './components/ExpenseManagement/ExpenseManagement';
import CategoryDetailsPage from './components/ExpenseManagement/CategoryDetails';
import HomePage from './components/HomePage';
import './App.css';
import { useTranslation } from 'react-i18next';
import { SnackbarProvider } from './components/SharedSnackbar';

// Custom Theme
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: blue[600],     // Primary color
      light: blue[400],
      dark: blue[800],
    },
    secondary: {
      main: teal[500],     // Secondary color
      light: teal[300],
      dark: teal[700],
    },
    background: {
      default: grey[100],  // Light background
      paper: '#ffffff',    // White paper background
    },
    text: {
      primary: grey[900],
      secondary: grey[600],
    },
  },
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: grey[900],
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: grey[900],
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: grey[800],
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: grey[800],
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: grey[800],
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: grey[800],
    },
    body1: {
      fontSize: '1rem',
      color: grey[700],
    },
    body2: {
      fontSize: '0.875rem',
      color: grey[600],
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
        },
        containedPrimary: {
          boxShadow: '0 3px 5px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  },
});

const App = () => {
  const { t } = useTranslation();

  const pages = [
    { path: '/', label: t('navbar.home') },
    { path: '/upload', label: t('navbar.fileUpload') },
    { path: '/expenses', label: t('navbar.expenseManagement') },
  ];

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <Router>
            <div dir="rtl">
              <AppBar pages={pages} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<FileUpload />} />
                <Route path="/expenses" element={<ExpenseManagement />} />
                <Route path="/:year/:month/details" element={<CategoryDetailsPage />} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;