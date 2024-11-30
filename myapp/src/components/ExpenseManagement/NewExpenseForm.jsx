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
import { useTranslation } from 'react-i18next';

const ManualExpenseForm = () => {
  const { t } = useTranslation();
  const categorySubcategoryMap = {
    costOfRevenues: [
      { label: t('categoryDetails.categories.salariesAndRelated'), value: 'salariesAndRelated' },
      { label: t('categoryDetails.categories.commissions'), value: 'commissions' },
      { label: t('categoryDetails.categories.equipmentAndSoftware'), value: 'equipmentAndSoftware' },
      { label: t('categoryDetails.categories.officeExpenses'), value: 'officeExpenses' },
      { label: t('categoryDetails.categories.vehicleMaintenance'), value: 'vehicleMaintenance' },
      { label: t('categoryDetails.categories.depreciation'), value: 'depreciation' },
    ],
    generalExpenses: [
      { label: t('categoryDetails.categories.managementServices'), value: 'managementServices' },
      { label: t('categoryDetails.categories.professionalServices'), value: 'professionalServices' },
      { label: t('categoryDetails.categories.advertising'), value: 'advertising' },
      { label: t('categoryDetails.categories.rentAndMaintenance'), value: 'rentAndMaintenance' },
      { label: t('categoryDetails.categories.postageAndCommunications'), value: 'postageAndCommunications' },
      { label: t('categoryDetails.categories.officeAndOther'), value: 'officeAndOther' },
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
                label={t('categoryDetails.date')}
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
                label={t('repeatExpense')}
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
                        label={t('monthly')}
                      />
                      <FormControlLabel
                        value="yearly"
                        control={<Radio />}
                        label={t('yearly')}
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={t('repeatUntil')}
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
                <InputLabel>{t('categoryDetails.categories.category')}</InputLabel>
                <Select
                  name="category"
                  value={formValues.category}
                  onChange={handleInputChange}
                >
                  <MenuItem value="costOfRevenues">{t('categoryDetails.categories.costOfRevenues')}</MenuItem>
                  <MenuItem value="generalExpenses">{t('categoryDetails.categories.generalExpenses')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('categoryDetails.categories.subCategory')}</InputLabel>
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
                label={t('categoryDetails.provider')}
                name="providerName"
                fullWidth
                value={formValues.providerName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('categoryDetails.amount')}
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
                label={t('note')}
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
                {t('addExpense')}
              </Button>
            </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ManualExpenseForm;