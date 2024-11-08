import React from 'react';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher.jsx'; // ייבוא הרכיב של החלפת השפות

const AppBar = ({ pages }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '10px', backgroundColor: '#6200ee', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        {pages.map((page) => (
          <button 
            key={page.path} 
            onClick={() => navigate(page.path)} 
            style={{ margin: '10px', color: '#fff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {page.label}
          </button>
        ))}
      </div>
      <LanguageSwitcher /> {/* הצגת כפתור החלפת שפות בצד ימין/שמאל של ה-AppBar */}
    </div>
  );
};

export default AppBar;
