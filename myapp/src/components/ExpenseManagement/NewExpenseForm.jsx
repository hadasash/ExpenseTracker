import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from '@mui/material';
import { apiService } from '../../services/apiService';

const ManualExpenseForm = () => {
  const categorySubcategoryMap = {
    costOfRevenues: [
      { label: 'Salaries and Related', value: 'salariesAndRelated' },
      { label: 'Commissions', value: 'commissions' },
      { label: 'Equipment and Software', value: 'equipmentAndSoftware' },
      { label: 'Office Expenses', value: 'officeExpenses' },
      { label: 'Vehicle Maintenance', value: 'vehicleMaintenance' },
      { label: 'Depreciation', value: 'depreciation' },
    ],
    generalExpenses: [
      { label: 'Management Services', value: 'managementServices' },
      { label: 'Professional Services', value: 'professionalServices' },
      { label: 'Advertising', value: 'advertising' },
      { label: 'Rent and Maintenance', value: 'rentAndMaintenance' },
      { label: 'Postage and Communications', value: 'postageAndCommunications' },
      { label: 'Office and Other', value: 'officeAndOther' },
    ],
  };

  const [isRecurring, setIsRecurring] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    subCategory: '',
    providerName: '',
    description: '',
    manualTotalAmount: '',
    manualInterval: 'monthly',
    intervalEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    note: '',
  });

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'manualTotalAmount' && value < 0) {
      return;
    }
    setFormValues({ ...formValues, [name]: value });

    if (name === 'category') {
      setFormValues((prevState) => ({ ...prevState, subCategory: '' }));
    }
  };

  const handleCheckboxChange = (event) => {
    setIsRecurring(event.target.checked);
    if (!event.target.checked) {
      setFormValues((prevState) => ({
        ...prevState,
        manualInterval: '',
        intervalEndDate: '',
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formValues.manualTotalAmount <= 0) {
      alert('Expense total must be greater than zero.');
      return;
    }

    const formattedDate = `${formValues.date}T00:00:00Z`;

    const payload = {
      ...formValues,
      date: formattedDate,
      totalAmount: formValues.manualTotalAmount,
      expenseType: 'manual',
      manualInterval: formValues.manualInterval,
    };
    if (!isRecurring) delete payload.intervalEndDate;
    setSuccess(false);
    try {
      const response = await apiService.addExpenseManually(payload);

      console.log('Server Response:', response);
      setSuccess(true);
    } catch (err) {
      console.error('Error adding expense', err);
      alert('Failed to add the expense. Please try again.');
    }
  };

  const availableSubcategories =
    categorySubcategoryMap[formValues.category] || [];

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: 'auto',
        padding: 2,
        boxShadow: 3,
        borderRadius: 2,
        background: 'white',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 150px)',
          padding: '10px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                label="Date"
                name="date"
                type="date"
                fullWidth
                value={formValues.date}
                onChange={handleInputChange}
                required
                InputLabel={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={4}>
              <FormControlLabel
                control={
                  <Checkbox checked={isRecurring} onChange={handleCheckboxChange} />
                }
                label="Repeat Expense"
              />
            </Grid>
            {isRecurring && (
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <RadioGroup
                      row
                      name="manualInterval"
                      value={formValues.manualInterval}
                      onChange={handleInputChange}
                    >
                      <FormControlLabel
                        value="monthly"
                        control={<Radio />}
                        label="Monthly"
                      />
                      <FormControlLabel
                        value="yearly"
                        control={<Radio />}
                        label="Yearly"
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Repeat until"
                      name="intervalEndDate"
                      type="date"
                      fullWidth
                      value={formValues.intervalEndDate}
                      onChange={handleInputChange}
                      required
                      InputLabel={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formValues.category}
                  onChange={handleInputChange}
                >
                  <MenuItem value="costOfRevenues">Cost of Revenues</MenuItem>
                  <MenuItem value="generalExpenses">General Expenses</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="subCategory"
                  value={formValues.subCategory}
                  onChange={handleInputChange}
                  disabled={!formValues.category}
                >
                  {availableSubcategories.map((subcategory) => (
                    <MenuItem 
                    key={subcategory.value} 
                    value={subcategory.value}
                    >
                      {subcategory.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Provider Name"
                name="providerName"
                fullWidth
                value={formValues.providerName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Total Amount"
                name="manualTotalAmount"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                value={formValues.manualTotalAmount}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Note"
                name="note"
                multiline
                fullWidth
                value={formValues.note}
                onChange={handleInputChange}
              />
             </Grid>
            </Grid>
            <Box ref={bottomRef} sx={{ display: 'flex', justifyContent: 'center', marginTop: 1 }}>
              <Button type="submit" variant="contained" color="primary">
                Add Expense
              </Button>
            </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ManualExpenseForm;