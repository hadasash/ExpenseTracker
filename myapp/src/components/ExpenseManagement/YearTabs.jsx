import React, { useState } from 'react';
import { Box, IconButton, MenuItem, Select, Tab, Tabs } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';

const YearTabs = ({ selectedMonth, setSelectedMonth, setYear }) => {
  const { t } = useTranslation(); 
  const [year, setYearState] = useState(2024);

  const handleYearIncrement = (increment) => {
    setYearState((prevYear) => {
      const newYear = prevYear + increment;
      setYear(newYear);
      return newYear;
    });
    setSelectedMonth(null);
  };

  const handleYearChange = (event) => {
    const newYear = event.target.value;
    setYearState(newYear);
    setYear(newYear);
    setSelectedMonth(null);
  };

  const handleMonthChange = (event, newMonth) => {
    setSelectedMonth(newMonth); // Pass month as number
  };

  const availableYears = Array.from({ length: 100 }, (_, index) => 1990 + index);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <IconButton onClick={() => handleYearIncrement(1)} size="small">
          <ArrowForwardIosIcon />
        </IconButton>
        <Select
          value={year}
          onChange={handleYearChange}
          variant="standard"
          disableUnderline
          sx={{
            minWidth: 80,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            mx: 1,
            '& .MuiSelect-select': {
              padding: 0,
            },
          }}
        >
          {availableYears.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </Select>
        <IconButton onClick={() => handleYearIncrement(-1)} size="small">
          <ArrowBackIosIcon />
        </IconButton>
      </Box>
      <Tabs
        value={selectedMonth}
        onChange={handleMonthChange}
        centered
        sx={{
          '& .MuiTab-root': {
            minWidth: 50,
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      >
        {[
          t('January'),t('February'),t('March'),t('April'),t('May'),t('June'),t('July'),t('August'),t('September'),t('October'),t('November'),t('December')
        ].map((month, index) => (
          <Tab key={index} label={month} value={index + 1} />
        ))}
      </Tabs>
    </Box>
  );
};

export default YearTabs;
