import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';

const InvoiceExpenseForm = () => {
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

  const [formValues, setFormValues] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    category: '',
    subCategory: '',
    invoiceNumber: '',
    providerName: '',
    invoiceTotal: '',
  });

  const [noInvoiceNumber, setNoInvoiceNumber] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Prevent negative values for invoiceTotal
    if (name === 'invoiceTotal' && value < 0) {
      return;
    }

    setFormValues({ ...formValues, [name]: value });

    if (name === 'category') {
      setFormValues((prevState) => ({ ...prevState, subCategory: '' }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Additional validation before submission
    if (formValues.invoiceTotal <= 0) {
      alert('Invoice Total must be greater than zero.');
      return;
    }

    // Set invoice number to '000' if no invoice number is provided
    const finalInvoiceNumber = noInvoiceNumber ? '000' : formValues.invoiceNumber;

    if (!finalInvoiceNumber && !noInvoiceNumber) {
      alert('Invoice Number is required unless "No Invoice Number" is checked.');
      return;
    }

    console.log('Form Submitted:', {
      ...formValues,
      invoiceNumber: finalInvoiceNumber,
    });
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
      <Typography variant="h5" mb={2}>
        Add New Invoice Expense
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '10px',
          marginBottom: '8px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Year"
                name="year"
                type="number"
                fullWidth
                value={formValues.year}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Month"
                name="month"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                value={formValues.month}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
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
                label="Invoice Total"
                name="invoiceTotal"
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                fullWidth
                value={formValues.invoiceTotal}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Invoice Number"
                name="invoiceNumber"
                fullWidth
                value={formValues.invoiceNumber}
                onChange={handleInputChange}
                required={!noInvoiceNumber}
                disabled={noInvoiceNumber}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noInvoiceNumber}
                    onChange={(e) => setNoInvoiceNumber(e.target.checked)}
                  />
                }
                label="No Invoice Number Available"
              />
            </Grid>
          </Grid>
          {/* Centered Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Add Expense
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default InvoiceExpenseForm;