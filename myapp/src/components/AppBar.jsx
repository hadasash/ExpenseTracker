// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const AppBar = ({ pages }) => {
//   const navigate = useNavigate();

//   return (
//     <div style={{ padding: '10px', backgroundColor: '#6200ee', color: '#fff' }}>
//       {pages.map((page) => (
//         <button 
//           key={page.path} 
//           onClick={() => navigate(page.path)} 
//           style={{ margin: '10px', color: '#fff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
//         >
//           {page.label}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default AppBar;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, AppBar as MuiAppBar, Toolbar, Button } from '@mui/material';
import LanguageSwitcher from './LanguageSwitcher'; // Adjust the import path as needed

// const AppBar = ({ pages }) => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   return (
//     <MuiAppBar position="static">
//       <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//           {pages.map((page) => (
//             <Button
//               key={page.path}
//               color="inherit"
//               onClick={() => navigate(page.path)}
//               sx={{ mr: 2 }}
//             >
//               {t(page.label)} {/* Use translation */}
//             </Button>
//           ))}
//         </Box>
//         <LanguageSwitcher />
//       </Toolbar>
//     </MuiAppBar>
//   );
// };
const AppBar = ({ pages }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <MuiAppBar position="static" sx={{ backgroundColor: '#1E40AF', color: '#FFFFFF' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {pages.map((page) => (
            <Button
              key={page.path}
              color="inherit"
              onClick={() => navigate(page.path)}
              sx={{ mr: 2, fontWeight: 600 }}
            >
              {t(page.label)}
            </Button>
          ))}
        </Box>
        <LanguageSwitcher />
      </Toolbar>
    </MuiAppBar>
  );
};
export default AppBar;