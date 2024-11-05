import React from 'react';
import { useNavigate } from 'react-router-dom';

const AppBar = ({ pages }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '10px', backgroundColor: '#6200ee', color: '#fff' }}>
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
  );
};

export default AppBar;
