import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang); 
  };

  return (
    <div>
      <Button onClick={() => handleChangeLanguage('he')}>עברית</Button>
      <Button onClick={() => handleChangeLanguage('en')}>English</Button>
    </div>
  );
};

export default LanguageSwitcher;
