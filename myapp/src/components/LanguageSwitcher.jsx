import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const languages = [
    { code: 'he', label: 'עברית', dir: 'rtl' },
    { code: 'en', label: 'English', dir: 'ltr' }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang.code);
    document.dir = lang.dir;
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={<LanguageIcon />}
        sx={{
          minWidth: 140,
          justifyContent: 'space-between',
          padding: theme.spacing(1, 2),
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.palette.background.paper,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
        }}
      >
        {currentLanguage.label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 140,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang)}
            selected={i18n.language === lang.code}
            sx={{
              gap: 1,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
              }
            }}
          >
            <ListItemText primary={lang.label} />
            {i18n.language === lang.code && (
              <ListItemIcon sx={{ minWidth: 'auto' }}>
                <CheckIcon fontSize="small" color="primary" />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;