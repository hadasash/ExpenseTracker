import React from 'react';
import { Button, Box } from '@mui/material';

const ActionButtons = () => {
  return (
    <Box display="flex" justifyContent="space-between">
      <Button variant="contained" color="primary">+ הוספת הוצאה</Button>
      <Button variant="outlined" color="primary">יצוא דוח שנתי</Button>
    </Box>
  );
};

export default ActionButtons;
