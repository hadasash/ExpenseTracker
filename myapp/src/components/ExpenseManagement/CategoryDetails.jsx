import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  IconButton,
  Tooltip,
  TablePagination,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { categorySubcategoryMap } from '../../constants/categoryMap';
import  apiService  from '../../services/apiService';
import * as XLSX from 'xlsx';
import { useSnackbar } from '../SharedSnackbar';

const CategoryDetailsPage = () => {
  const { year, month } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();
  const { openSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editedSubCategory, setEditedSubCategory] = useState('');

  const mainCategory = location.state?.mainCategory;
  const subCategory = location.state?.subCategory;

  const categories = categorySubcategoryMap(t);
  const mainCategoryObject = categories.categories.find(category => category.value === mainCategory);
  const mainCategoryLabel = mainCategoryObject?.label || t('categoryDetails.unknown');

  const subCategoryObject = categories[mainCategory]?.find(sub => sub.value === subCategory);
  const subCategoryLabel = subCategoryObject?.label || t('categoryDetails.unknown');

  const hebrewMonth = useMemo(() => 
    new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(new Date(year, parseInt(month) - 1)),
    [year, month]
  );

  const expenseTypeDisplayNames = {
    'invoice': 'Invoice',
    'salarySlip': 'Salary Slip',
    'manual': 'Manual Entry'
  };

  const availableSubCategories = categories[mainCategory] || [];

  const onExpensesUpdated = async () => {
    try {
      // Use expenses passed from ExpenseManagement via location state
      const expensesFromManagement = location.state?.expenses || [];
      console.log("Expenses from Management:", expensesFromManagement);

      // Filter expenses by main category and subcategory
      const filteredExpenses = expensesFromManagement.filter(expense => 
        expense.mainCategory === mainCategory && 
        expense.subCategory === subCategory
      );

      setExpenses(filteredExpenses);
    } catch (error) {
      console.error('Error processing expenses:', error);
      openSnackbar(t('categoryDetails.fetchError'), 'error');
    }
  };

  const handleUpdateSubCategory = async (expense) => {
    try {
      // Validate subcategory selection
      if (!editedSubCategory) {
        openSnackbar(t('categoryDetails.selectSubcategory'), 'error');
        return;
      }

      // Find the expense ID (handling different possible ID fields)
      const expenseId = expense._id || expense.id;

      // Update the expense via API
      const updatedExpense = await apiService.updateExpense(expenseId, {
        subCategory: editedSubCategory
      });

      // Update the expenses list
      const updatedExpenses = expenses.map(exp => 
        exp._id === expenseId || exp.id === expenseId 
          ? { ...exp, subCategory: editedSubCategory } 
          : exp
      );

      setExpenses(updatedExpenses);
      setEditingExpenseId(null);
      openSnackbar(t('categoryDetails.subcategoryUpdated'), 'success');
    } catch (error) {
      console.error('Detailed error updating subcategory:', {
        message: error.message,
        networkError: error.code === 'ERR_NETWORK',
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });

      // Specific error handling
      if (error.code === 'ERR_NETWORK') {
        openSnackbar(t('categoryDetails.networkError'), 'error');
      } else {
        openSnackbar(t('categoryDetails.updateError'), 'error');
      }
    }
  };

  const renderSubcategoryCell = (expense) => {
    // If currently editing this expense
    if (editingExpenseId === expense._id || expense.id) {
      return (
        <TableCell sx={{ 
          maxWidth: 200, 
          p: 1, 
          textAlign: 'right',
          '& > div': { justifyContent: 'flex-end' }
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              gap: 0.5,
              width: '100%'
            }}
          >
            <FormControl 
              size="small" 
              sx={{ 
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: 35,
                  '& input': {
                    py: 1,
                    px: 1,
                    textAlign: 'right'
                  }
                }
              }}
            >
              <Select
                value={editedSubCategory}
                onChange={(e) => setEditedSubCategory(e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  const selectedSub = availableSubCategories.find(sub => sub.value === selected);
                  return selectedSub ? selectedSub.label : t('categoryDetails.selectSubcategory');
                }}
                size="small"
                sx={{ 
                  textAlign: 'right',
                  '& .MuiSelect-select': {
                    textAlign: 'right'
                  }
                }}
              >
                {availableSubCategories.map((sub) => (
                  <MenuItem 
                    key={sub.value} 
                    value={sub.value}
                    sx={{ 
                      fontSize: '0.875rem',
                      justifyContent: 'flex-end'
                    }}
                  >
                    {sub.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleUpdateSubCategory(expense)}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                color="secondary" 
                onClick={() => setEditingExpenseId(null)}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </TableCell>
      );
    }

    // Default display of subcategory
    return (
      <TableCell sx={{ 
        maxWidth: 150, 
        p: 1, 
        textAlign: 'right',
        '& > div': { justifyContent: 'flex-end' }
      }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            width: '100%'
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'right'
            }}
          >
            {expense.subCategory || t('categoryDetails.unknown')}
          </Typography>
          <IconButton 
            size="small"
            onClick={() => {
              setEditingExpenseId(expense._id || expense.id);
              setEditedSubCategory(expense.subCategory);
            }}
            sx={{ 
              ml: 0.5,
              p: 0.5
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    );
  };

  const renderExpenseAmount = (expense) => {
    const originalAmount = expense.totalAmount;
    const convertedAmount = expense.convertedAmountILS || originalAmount;
    const conversionRate = expense.conversionRate || 1;

    // If the currency is not ILS, show both original and converted amounts
    if (expense.currency !== 'ILS') {
      return (
        <Box>
          <Typography variant="body2">
            {`${originalAmount.toLocaleString()} ${expense.currency}`}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {`₪${convertedAmount.toLocaleString()} (Rate: ${conversionRate.toFixed(2)})`}
          </Typography>
        </Box>
      );
    }

    // If the currency is already ILS, just show the amount
    return (
      <Typography variant="body2">
        {`₪${convertedAmount.toLocaleString()}`}
      </Typography>
    );
  };

  const handleDownload = () => {
    const worksheetData = expenses.map((expense) => ({
      [t('categoryDetails.date')]: new Date(expense.date).toLocaleDateString(),
      [t('categoryDetails.type')]: expenseTypeDisplayNames[expense.expenseType] || expense.expenseType,
      [t('categoryDetails.subcategory')]: expense.subCategory || t('categoryDetails.unknown'),
      [t('categoryDetails.provider')]: expense.providerName || expense.employeeName || t('categoryDetails.unknown'),
      [t('categoryDetails.expenseNumber')]: expense.expenseType === 'manual' ? '' : expense.invoiceId || expense.salarySlipId || t('categoryDetails.unknown'),
      [t('categoryDetails.originalAmount')]: `${expense.totalAmount.toLocaleString()} ${expense.currency}`,
      [t('categoryDetails.convertedAmount')]: `₪${(expense.convertedAmountILS || expense.totalAmount).toLocaleString()}`,
      [t('categoryDetails.conversionRate')]: expense.conversionRate || 1,
      [t('categoryDetails.conversionDate')]: expense.date ? new Date(expense.date).toLocaleDateString() : t('categoryDetails.unknown')
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

    XLSX.writeFile(workbook, `Expenses_${mainCategoryLabel}_${hebrewMonth}_${year}.xlsx`);
    openSnackbar(t('categoryDetails.downloadSuccess'), 'success');
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    try {
      const extractExpenseId = (expense) => {
        const possibleIdFields = ['_id', 'id', 'expenseId', 'invoiceId'];
        
        for (const field of possibleIdFields) {
          if (expense[field]) {
            return expense[field];
          }
        }

        console.error('No valid ID found for expense:', expense);
        return null;
      };

      const expenseId = extractExpenseId(selectedExpense);

      if (!expenseId) {
        console.error('No valid ID found for expense:', selectedExpense);
        openSnackbar(t('categoryDetails.deleteError'), 'error');
        return;
      }

      await apiService.deleteExpense(expenseId);
      
      await onExpensesUpdated();

      openSnackbar(t('categoryDetails.expenseDeleted'), 'success');
    } catch (error) {
      console.error('Detailed delete expense error:', error);
      openSnackbar(t('categoryDetails.deleteError'), 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedExpense(null);
    }
  };

  const openDeleteConfirmation = (expense) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setDeleteDialogOpen(false);
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (expense.convertedAmountILS || expense.totalAmount), 0);
  }, [expenses]);

  useEffect(() => {
    onExpensesUpdated();
  }, [location.state]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box 
      sx={{ 
        p: { xs: 3, md: 6 }, 
        minHeight: '100vh',
        backgroundColor: '#f0f4f8',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}
    >
      {/* Professional Header */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: '#4a90e2',
          color: 'white'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: { xs: 2, md: 4 },
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: '0.5px',
                color: 'white'
              }}
            >
              {mainCategoryLabel}
            </Typography>
            {subCategory && (
              <Chip 
                label={t(`categoryDetails.categories.${subCategory}`, { defaultValue: subCategory })} 
                color="default"
                sx={{ 
                  alignSelf: 'flex-start',
                  fontWeight: 600,
                  backgroundColor: '#f0f4f8',
                  color: '#2c3e50',
                  border: '1px solid #a0aec0',
                  px: 1,
                  py: 0.5,
                  borderRadius: 2
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontWeight: 600
              }}
            >
              {hebrewMonth} {year}
            </Typography>
            <Tooltip title={t('categoryDetails.downloadExpenses')}>
              <IconButton 
                size="medium"
                onClick={handleDownload}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    color: '#e74c3c'
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Expenses Table */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          background: 'white'
        }}
      >
        <TableContainer>
          <Table sx={{ 
            minWidth: 650,
            '& .MuiTableCell-root': {
              py: 2,
              px: 3,
              borderBottom: '1px solid #e0e4e8',
              textAlign: 'right'
            }
          }}>
            <TableHead sx={{ 
              backgroundColor: '#4a90e2',
              color: 'white'
            }}>
              <TableRow>
                {['date', 'type', 'subcategory', 'provider', 'amount', 'expenseNumber', 'actions'].map((header) => (
                  <TableCell 
                    key={header} 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      textAlign: 'right'
                    }}
                  >
                    {t(`categoryDetails.${header}`)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? expenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : expenses
              ).map((expense, index) => (
                <TableRow 
                  key={index} 
                  hover
                  sx={{
                    '&:nth-of-type(even)': {
                      backgroundColor: '#f9fafb'
                    },
                    '&:hover': {
                      backgroundColor: '#e6f2ff'
                    }
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        textAlign: 'right'
                      }}
                    >
                      {new Date(expense.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={expenseTypeDisplayNames[expense.expenseType] || expense.expenseType}
                      size="small"
                      sx={{ 
                        backgroundColor: '#50c878',
                        color: 'white',
                        fontWeight: 600,
                        textAlign: 'right'
                      }}
                    />
                  </TableCell>
                  {renderSubcategoryCell(expense)}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#2c3e50', textAlign: 'right' }}>
                      {expense.providerName || expense.employeeName || t('categoryDetails.unknown')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {renderExpenseAmount(expense)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#4a5568', textAlign: 'right' }}>
                      {expense.invoiceNumber || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t('categoryDetails.deleteExpense')}>
                      <IconButton 
                        size="small"
                        onClick={() => openDeleteConfirmation(expense)}
                        sx={{
                          color: '#4a5568',
                          transition: 'color 0.2s ease',
                          '&:hover': {
                            color: '#e74c3c'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  sx={{ 
                    backgroundColor: '#f0f4f8',
                    borderTop: '2px solid #4a90e2',
                    py: 2,
                    px: 4,
                    textAlign: 'right'
                  }}
                >
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ReceiptIcon 
                        sx={{ 
                          color: '#4a90e2',
                          fontSize: 24
                        }} 
                      />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#2c3e50',
                          textAlign: 'right'
                        }}
                      >
                        {t('categoryDetails.totalExpenditure')}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#e74c3c',
                        textAlign: 'right'
                      }}
                    >
                      ₪{totalExpenses.toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          component="div"
          count={expenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': {
              justifyContent: 'center',
              padding: 3,
              backgroundColor: '#f9fafb'
            }
          }}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="delete-expense-dialog-title"
        aria-describedby="delete-expense-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle 
          id="delete-expense-dialog-title"
          sx={{ 
            backgroundColor: '#f0f4f8', 
            color: '#2c3e50',
            fontWeight: 700 
          }}
        >
          {t('categoryDetails.confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText 
            id="delete-expense-dialog-description"
            sx={{ color: '#4a5568' }}
          >
            {selectedExpense && t('categoryDetails.deleteConfirmationText', {
              amount: selectedExpense.totalAmount.toFixed(2),
              provider: selectedExpense.providerName || selectedExpense.employeeName
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseConfirmDialog} 
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteExpense} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
            autoFocus
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryDetailsPage;