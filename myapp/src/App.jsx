import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppBar from './components/AppBar';
import FileUpload from './components/FileUpload';
import ExpenseManagement from './components/ExpenseManagement/ExpenseManagement';
import CategoryDetailsPage from './components/ExpenseManagement/CategoryDetails';
import './App.css';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher.jsx'; 
import "./utils/i18n.js"
const App = () => {
  const { t, i18n } = useTranslation();
  const pages = [
    { path: '/upload', label: t('uploadButton') },
    { path: '/expenses', label: t('expenseManager') },
  ];

  return (
    <Router>
      <div dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
        <AppBar pages={pages} />
        <LanguageSwitcher /> {/* הוספת כפתור החלפת שפות */}
        <Routes>
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/expenses" element={<ExpenseManagement />} />
          <Route path="/" element={<h1>{t('welcomeMessage')}</h1>} />
          <Route path="/:year/:month/details" element={<CategoryDetailsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
