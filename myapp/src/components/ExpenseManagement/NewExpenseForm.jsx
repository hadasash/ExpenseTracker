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
  RadioGroup,
  Radio,
  Typography,
} from '@mui/material';
import { apiService } from '../../services/apiService';
import { useTranslation } from 'react-i18next';
import { categorySubcategoryMap } from '../../constants/categoryMap';

const ManualExpenseForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Use imported categorySubcategoryMap with translation function
  const categories = categorySubcategoryMap(t);

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
    intervalEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split('T')[0],
    note: '',
  });

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setFormValues({ ...formValues });
  }, [i18n.language]);

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
    const checked = event.target.checked;
    setIsRecurring(checked);
  
    setFormValues((prevState) => ({
      ...prevState,
      manualInterval: checked ? 'monthly' : '',
      intervalEndDate: checked
        ? new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split('T')[0]
        : '',
    }));
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
    };
  
    // Remove recurring fields if not recurring
    if (!isRecurring) {
      delete payload.manualInterval;
      delete payload.intervalEndDate;
    }
  
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

  const availableSubcategories = categories[formValues.category] || [];

  if (success) {
    return (
      <Typography variant="h6" align="center" color="success.main">
        {t('expenseAddedSuccessfully')}
      </Typography>
    );
  }

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
        flexDirection: isRTL ? 'row-reverse' : 'row',
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
            <Grid item xs={6}>
              <TextField
                label={t('categoryDetails.date')}
                name="date"
                type="date"
                fullWidth
                value={formValues.date}
                onChange={handleInputChange}
                required
                sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
              />
            </Grid>
            <Grid item xs={6}>
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
                  {categories.categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
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
                    <MenuItem key={subcategory.value} value={subcategory.value}>
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