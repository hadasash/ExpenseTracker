
import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Grid, 
    Box, 
    Alert, 
    Typography, 
    Paper, 
    Card, 
    CardContent 
} from '@mui/material';
import YearTabs from './YearTabs';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGraph from './ExpenseGraph';
import CategoryBreakdown from './CategoryBreakdown';
import ActionButtons from './ActionButtons';
import  apiService  from '../../services/apiService';
import { useTranslation } from 'react-i18next';

const ExpenseManagement = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(2024);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    const calculateTotals = (expensesArray) => {
        if (!Array.isArray(expensesArray) || expensesArray.length === 0) {
            return { 
                totalAmount: 0, 
                mainCategoryTotals: {}, 
                subCategoryTotals: {} 
            };
        }

        // Detailed logging for debugging
        const expenseDetails = expensesArray.map(expense => ({
            totalAmount: expense.totalAmount,
            convertedAmountILS: expense.convertedAmountILS,
            currency: expense.currency,
            date: expense.date
        }));
        console.group('Total Amount Calculation');
        console.log('Expense Details:', expenseDetails);

        const totalAmount = expensesArray.reduce((sum, expense) => {
            const amount = expense.convertedAmountILS || expense.totalAmount || 0;
            const parsedAmount = Number(amount);
            
            return sum + (isNaN(parsedAmount) ? 0 : parsedAmount);
        }, 0);

        console.log('Calculated Total Amount:', totalAmount);
        console.groupEnd();

        const mainCategoryTotals = expensesArray.reduce((acc, expense) => {
            const mainCategory = expense.mainCategory || 'Uncategorized';
            const amount = Number(expense.convertedAmountILS || expense.totalAmount) || 0;
            acc[mainCategory] = (acc[mainCategory] || 0) + amount;
            return acc;
        }, {});

        const subCategoryTotals = expensesArray.reduce((acc, expense) => {
            const subCategory = expense.subCategory || 'Unspecified';
            const amount = Number(expense.convertedAmountILS || expense.totalAmount) || 0;
            acc[subCategory] = (acc[subCategory] || 0) + amount;
            return acc;
        }, {});

        return { 
            totalAmount, 
            mainCategoryTotals, 
            subCategoryTotals 
        };
    };

    const calculateMonthlyTotals = (expenses) => {
        // Initialize an array to store monthly totals
        const monthlyTotals = new Array(12).fill(0);

        // Detailed logging array to understand each expense
        const expenseDetails = [];

        // Iterate through all expenses
        expenses.forEach(expense => {
            // Parse the date of the expense
            const expenseDate = new Date(expense.date);
            
            // Extract year and month
            const expenseYear = expenseDate.getFullYear();
            const expenseMonth = expenseDate.getMonth();
            
            // Get the total amount, prioritizing convertedAmountILS
            const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);

            // Store detailed expense information for debugging
            expenseDetails.push({
                date: expense.date,
                year: expenseYear,
                month: expenseMonth,
                amount: amount,
                providerName: expense.providerName
            });

            // Add to monthly totals if the amount is valid
            if (amount > 0) {
                monthlyTotals[expenseMonth] += amount;
            }
        });

        // Log detailed breakdown for debugging
        console.group('Monthly Totals Calculation');
        console.log('Expense Details:', expenseDetails);
        console.log('Monthly Totals:', monthlyTotals);
        console.groupEnd();

        return monthlyTotals;
    };

    const calculateDetailedExpenseTotals = (expenses) => {
        console.group('Detailed Expense Calculation');
        
        // Breakdown by expense
        const expenseBreakdown = expenses.map(expense => ({
            date: expense.date,
            totalAmount: Number(expense.totalAmount || 0),
            manualTotalAmount: Number(expense.manualTotalAmount || 0),
            providerName: expense.providerName,
            currency: expense.currency
        }));
        
        console.log('Expense Breakdown:', expenseBreakdown);

        // Calculate totals
        const totalAmount = expenseBreakdown.reduce((sum, expense) => 
            sum + (expense.manualTotalAmount || expense.totalAmount), 0);
        
        console.log('Total Amount:', totalAmount);
        console.groupEnd();

        return {
            totalAmount,
            expenseBreakdown
        };
    };

    const [yearCalculations, setYearCalculations] = useState({
        currentYear: { totalAmount: 0, mainCategoryTotals: {}, subCategoryTotals: {}, monthlyTotals: new Array(12).fill(0) },
    });

    const fetchYearCalculations = async (targetYear, targetMonth, isCurrentYear = false) => {
        try {
            // Fetch expenses for the entire year
            const yearStartDate = new Date(targetYear, 0, 1).toISOString();
            const yearEndDate = new Date(targetYear, 11, 31).toISOString();
            const yearData = await apiService.getExpensesByDateRange(yearStartDate, yearEndDate);

            if (!Array.isArray(yearData)) {
                return { 
                    totalAmount: 0, 
                    monthlyTotals: new Array(12).fill(0)
                };
            }

            // Calculate monthly totals using the new function
            const monthlyTotals = calculateMonthlyTotals(yearData);

            if (isCurrentYear) {
                const currentYearTotals = calculateTotals(yearData);
                return { 
                    ...currentYearTotals, 
                    monthlyTotals 
                };
            }

            const totalAmount = monthlyTotals.reduce((sum, amount) => sum + amount, 0);

            return { 
                totalAmount, 
                monthlyTotals 
            };
        } catch (err) {
            console.error(`Failed to fetch expenses for ${targetYear}`, err);
            return { 
                totalAmount: 0, 
                monthlyTotals: new Array(12).fill(0)
            };
        }
    };

    useEffect(() => {
        const fetchExpensesForYears = async () => {
            if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
                console.error("Invalid selectedMonth:", selectedMonth);
                return;
            }

            const yearCalculations = {
                currentYear: await fetchYearCalculations(year, selectedMonth, true)
            };

            setYearCalculations(yearCalculations);

            const startDate = new Date(year, selectedMonth - 1, 1).toISOString();
            const endDate = new Date(year, selectedMonth, 0).toISOString();

            console.group('Fetching Expenses');
            console.log('Start Date:', startDate);
            console.log('End Date:', endDate);

            setLoading(true);
            try {
                const data = await apiService.getExpensesByDateRange(startDate, endDate);
                console.log('Fetched Expenses:', data);

                if (Array.isArray(data)) {
                    setExpenses(data);
                    setError(null);

                    // Additional detailed calculation
                    const detailedTotals = calculateDetailedExpenseTotals(data);
                    console.log('Detailed Totals:', detailedTotals);
                }
            } catch (err) {
                setError("Failed to fetch expense data");
                console.error(err);
            } finally {
                setLoading(false);
                console.groupEnd();
            }
        };

        fetchExpensesForYears();
    }, [selectedMonth, year]);

    // Calculate total for the specific month with detailed logging
    const monthTotalAmount = expenses.reduce((sum, expense) => {
        const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);
        console.log('Individual Expense:', {
            date: expense.date,
            providerName: expense.providerName,
            amount: amount
        });
        return sum + amount;
    }, 0);

    console.log('Final Month Total Amount:', monthTotalAmount);

    const { totalAmount, mainCategoryTotals, subCategoryTotals } = calculateTotals(expenses);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Year and Month Tabs */}
            <YearTabs
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                setYear={setYear}
                yearCalculations={yearCalculations}
            />

            {/* Action Buttons - Moved to top */}
            <Box mb={4} mt={2}>
                <ActionButtons 
                    expenses={expenses}
                    selectedMonth={selectedMonth}
                    year={year}
                    onUpload={apiService.processExpense} 
                />
            </Box>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24' }}>
                    {error}
                </Alert>
            )}

            {/* Expense Summary, Graph, and Breakdown */}
            {expenses.length === 0 ? (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 3, borderRadius: '12px' }}>
                    <Typography variant="h6" color="textSecondary">
                        {t('NoExpensesRecordedFor')} {selectedMonth}/{year}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Card sx={{ mb: 3, borderRadius: '16px',  flex: '0 0 25%' }}>
                            <CardContent>
                                <ExpenseSummary
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    totalAmount={monthTotalAmount}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, borderRadius: '16px', flex: 1 }}>
                            <CardContent>
                                <CategoryBreakdown
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    expenses={expenses}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Card sx={{ mb: 3, borderRadius: '16px',  flex: 1 }}>
                            <CardContent>
                                <ExpenseGraph
                                    selectedMonth={selectedMonth}
                                    mainCategoryTotals={mainCategoryTotals}
                                    subCategoryTotals={subCategoryTotals}
                                    year={year}
                                    expenses={expenses}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default ExpenseManagement;
