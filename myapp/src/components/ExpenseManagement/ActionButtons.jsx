import React, { useState } from 'react';
import { Button, Box, Modal, Typography, Paper } from '@mui/material';
import NewExpenseForm from './NewExpenseForm';

const ActionButtons = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box display="flex" justifyContent="space-between" gap={2}>
      {/* כפתור הוספת הוצאה */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          paddingX: 3,
          paddingY: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#3f51b5', // צבע כהה יותר כאשר העכבר מעל הכפתור
          },
        }}
      >
        הוספת הוצאה
      </Button>

      {/* כפתור יצוא דוח חודשי */}
      <Button
        variant="outlined"
        color="primary"
        sx={{
          paddingX: 3,
          paddingY: 1.5,
          borderRadius: 2,
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#f1f1f1', // צבע רך יותר כאשר העכבר מעל
          },
        }}
      >
        יצוא דוח חודשי
      </Button>

      {/* Modal עבור טופס הוצאה חדשה */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            width: 600,
            margin: 'auto',
            mt: 8,
            padding: 3,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: 24,
            overflow: 'auto',
          }}
        >
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
            הוספת הוצאה חדשה
          </Typography>
          <NewExpenseForm onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default ActionButtons;
