import React, { useState } from 'react';
import { Box, IconButton, Tab, Tabs, Typography } from '@mui/material';
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

  const handleMonthChange = (event, newMonth) => {
    setSelectedMonth(newMonth);
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        {/* Left Arrow */}
        <IconButton onClick={() => handleYearIncrement(-1)} size="small">
          <ArrowBackIosIcon />
        </IconButton>

        {/* Year Display */}
        <Box display="flex" alignItems="center" mx={2}>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mx: 2 }}>
            {year + 1}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {year}
          </Typography>

          <Typography variant="subtitle1" color="textSecondary" sx={{ mx: 2 }}>
            {year - 1}
          </Typography>
        </Box>

        {/* Right Arrow */}
        <IconButton onClick={() => handleYearIncrement(1)} size="small">
          <ArrowForwardIosIcon />
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
          t('January'), t('February'), t('March'), t('April'), t('May'),
          t('June'), t('July'), t('August'), t('September'), t('October'),
          t('November'), t('December'),
        ].map((month, index) => (
          <Tab key={index} label={month} value={index + 1} />
        ))}
      </Tabs>
    </Box>
  );
};

export default YearTabs;