import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import AppBar from './components/AppBar';
import FileUpload from './components/FileUpload';
import ExpenseManagement from './components/ExpenseManagement/ExpenseManagement';
import CategoryDetailsPage from './components/ExpenseManagement/CategoryDetails';
import './App.css'

const pages = [
  { path: '/upload', label: 'העלאת קבצים' },
  { path: '/expenses', label: 'ניהול הוצאות' },
];

const App = () => {
  return (
    <Router>
      <div dir="rtl">
        <AppBar pages={pages} />
        <Routes>
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/expenses" element={<ExpenseManagement />} />
          <Route path="/" element={<h1>ברוך הבא</h1>} />
          <Route path="/:year/:month/details" element={<CategoryDetailsPage />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
