import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Tab, Tabs, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTranslation } from 'react-i18next';

const YearTabs = ({ selectedMonth, setSelectedMonth, setYear, yearCalculations }) => {
  const { t } = useTranslation();
  const [year, setYearState] = useState(2024);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleYearIncrement = (increment) => {
    setYearState((prevYear) => {
      const newYear = prevYear + increment;
      setYear(newYear);
      return newYear;
    });
  };

  const handleYearChange = (newYear) => {
    setYearState(newYear);
    setYear(newYear);
    setAnchorEl(null); // Close the menu after selection
  };

  const handleMonthChange = (event, newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleYearClick = (event) => {
    setAnchorEl(event.currentTarget); // Open the menu
  };

  const handleClose = () => {
    setAnchorEl(null); // Close the menu
  };

  const formatTotal = (total) => {
    if (total === undefined || total === null) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(total);
  };  

  const availableYears = Array.from({ length: 100 }, (_, index) => 1990 + index);

  return (
    <Box>
    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
      {/* Left Arrow */}
      <IconButton onClick={() => handleYearIncrement(-1)} size="small">
        <ArrowForwardIosIcon sx={{ color: '#9e9e9e' }} />
      </IconButton>

      {/* Next Year */}
      <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.9rem', color: '#9e9e9e', cursor: 'pointer' }}
          onClick={() => handleYearChange(year + 1)}
        >
          {year + 1}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9e9e9e', display: 'block' }}>
          {formatTotal(yearCalculations.nextYear.totalAmount)}
        </Typography>
      </Box>

      {/* Spacer for alignment */}
      <Box sx={{ minWidth: '20px' }} />

      {/* Current Year */}
      <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={handleYearClick}
        >
          {year}
        </Typography>
      </Box>

      {/* Spacer for alignment */}
      <Box sx={{ minWidth: '20px' }} />

      {/* Previous Year */}
      <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
        <Typography
          variant="body2"
          sx={{ fontSize: '0.9rem', color: '#9e9e9e', cursor: 'pointer' }}
          onClick={() => handleYearChange(year - 1)}
        >
          {year - 1}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9e9e9e', display: 'block' }}>
          {formatTotal(yearCalculations.previousYear.totalAmount)}
        </Typography>
      </Box>

      {/* Right Arrow */}
      <IconButton onClick={() => handleYearIncrement(1)} size="small">
        <ArrowBackIosIcon sx={{ color: '#9e9e9e' }} />
      </IconButton>

      {/* Year Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {availableYears.map((y) => (
          <MenuItem key={y} onClick={() => handleYearChange(y)}>
            {y}
          </MenuItem>
        ))}
      </Menu>
    </Box>



      <Tabs
        value={selectedMonth || 1}
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
          t('January'), t('February'), t('March'), t('April'), t('May'), t('June'),
          t('July'), t('August'), t('September'), t('October'), t('November'), t('December')
        ].map((month, index) => (
          <Tab key={index} label={month} value={index + 1} />
        ))}
      </Tabs>
    </Box>
  );
};

export default YearTabs;