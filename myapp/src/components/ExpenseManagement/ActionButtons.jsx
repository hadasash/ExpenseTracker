import React, { useState } from 'react';
import { Button, Box, Modal } from '@mui/material';
import NewExpenseForm from './NewExpenseForm';

const ActionButtons = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box display="flex" justifyContent="space-between">
      <Button variant="contained" color="primary" onClick={handleOpen}>
        + הוספת הוצאה
      </Button>
      <Button variant="outlined" color="primary">
        יצוא דוח שנתי
      </Button>

      {/* Modal for New Expense Form */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ width: 600, margin: 'auto', mt: 10 }}>
          <NewExpenseForm onClose={handleClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default ActionButtons;
