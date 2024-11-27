import React, { useState, useRef, useEffect } from 'react';
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

  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    subCategory: '',
    invoiceNumber: '',
    providerName: '',
    invoiceTotal: '',
  });

  const [noInvoiceNumber, setNoInvoiceNumber] = useState(false);

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && bottomRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'invoiceTotal' && value < 0) {
      return;
    }

    setFormValues({ ...formValues, [name]: value });

    if (name === 'category') {
      setFormValues((prevState) => ({ ...prevState, subCategory: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (formValues.invoiceTotal <= 0) {
      alert('Invoice Total must be greater than zero.');
      return;
    }
  
    const finalInvoiceNumber = noInvoiceNumber ? '000' : formValues.invoiceNumber;
  
    if (!finalInvoiceNumber && !noInvoiceNumber) {
      alert('Invoice Number is required unless "No Invoice Number" is checked.');
      return;
    }
  
    const formattedDate = `${formValues.date}T00:00:00Z`;
  
    const payload = {
      ...formValues,
      date: formattedDate,
      invoiceNumber: finalInvoiceNumber,
    };
  
    setSuccess(false);
  
    try {
      const response = await apiService.addExpenseManually(payload);
  
      console.log('Server Response:', response);
      setSuccess(true);
      setExpenses((prev) => [...prev, response]);

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
            <Grid item xs={12}>
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