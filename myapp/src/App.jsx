import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import i18n from './utils/i18n'; 
import AppBar from './components/AppBar';
import FileUpload from './components/FileUpload/FileUpload';
import ExpenseManagement from './components/ExpenseManagement/ExpenseManagement';
import CategoryDetailsPage from './components/ExpenseManagement/CategoryDetails';
import './App.css';
import { useTranslation } from 'react-i18next';

// Create a theme that supports RTL
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
        }
      `,
    },
  },
});

const App = () => {
  const { t } = useTranslation();

  const pages = [
    { path: '/upload', label: t('navbar.fileUpload') },
    { path: '/expenses', label: t('navbar.expenseManagement') },
  ];

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <Router>
          <div dir="rtl">
            <AppBar pages={pages} />
            <Routes>
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/expenses" element={<ExpenseManagement />} />
              {/* <Route path="/" element={<HomePage />} /> */}
              <Route path="/:year/:month/details" element={<CategoryDetailsPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;