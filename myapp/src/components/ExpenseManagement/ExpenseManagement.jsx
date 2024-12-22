import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, 
    Grid, 
    Box, 
    Alert, 
    Paper, 
    Card, 
    CardContent,
    Skeleton,
    Typography,
} from '@mui/material';
import YearTabs from './YearTabs';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGraph from './Graph/ExpenseGraph';
import CategoryBreakdown from './CategoryBreakdown';
import ActionButtons from './ActionButtons';
import apiService from '../../services/apiService';
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

        const expenseDetails = expensesArray.map(expense => ({
            totalAmount: expense.totalAmount,
            convertedAmountILS: expense.convertedAmountILS,
            currency: expense.currency,
            date: expense.date
        }));
        console.group('Total Amount Calculation');
        console.log('Expense Details:', expenseDetails);

        const totalAmount = expensesArray.reduce((sum, expense) => {
            const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);
            return sum + (isNaN(amount) ? 0 : amount);
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
        const monthlyTotals = new Array(12).fill(0);
        const expenseDetails = [];

        expenses.forEach(expense => {
            // Parse the date of the expense
            const expenseDate = new Date(expense.date);
            
            // Extract year and month
            const expenseYear = expenseDate.getFullYear();
            const expenseMonth = expenseDate.getMonth();
            
            const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);

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

        console.group('Monthly Totals Calculation');
        console.log('Expense Details:', expenseDetails);
        console.log('Monthly Totals:', monthlyTotals);
        console.groupEnd();

        return monthlyTotals;
    };

    const calculateDetailedExpenseTotals = (expenses) => {
        console.group('Detailed Expense Calculation');
        
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

    const fetchYearCalculations = async (targetYear, isCurrentYear = false) => {
        try {
            const yearStartDate = new Date(targetYear, 0, 1).toISOString();
            const yearEndDate = new Date(targetYear, 11, 31).toISOString();
            const yearData = await apiService.getExpensesByDateRange(yearStartDate, yearEndDate);

            if (!Array.isArray(yearData)) {
                return { 
                    totalAmount: 0, 
                    monthlyTotals: new Array(12).fill(0)
                };
            }

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

            const startDate = new Date(Date.UTC(year, selectedMonth - 1, 1)).toISOString();
            const endDate = new Date(Date.UTC(year, selectedMonth, 0, 23, 59, 59)).toISOString();

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

    const monthTotalAmount = expenses.reduce((sum, expense) => {
        const amount = Number(expense.convertedAmountILS || expense.totalAmount || 0);
        console.log('Individual Expense:', {
            date: expense.date,
            providerName: expense.providerName,
            amount: amount
        });
        return sum + amount;
    }, 0);

    const { mainCategoryTotals, subCategoryTotals } = calculateTotals(expenses);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Year and Month Tabs */}
            <YearTabs
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                setYear={setYear}
                yearCalculations={yearCalculations}
            />

            {/* Action Buttons */}
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
                <Alert role="alert" severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
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
                    {/* Expense Summary */}
                    <Card
                        sx={{
                            mb: 3,
                            borderRadius: '16px',
                            minHeight: '100px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <CardContent>
                            <ExpenseSummary
                                selectedMonth={selectedMonth}
                                year={year}
                                totalAmount={monthTotalAmount}
                                loading={loading}
                            />
                        </CardContent>
                    </Card>

                    {/* Category Breakdown */}
                    <Card
                        sx={{
                            mb: 8,
                            borderRadius: '16px',
                            minHeight: '250px',
                            maxHeight: '400px',
                            overflow: 'auto',
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CardContent>
                            {loading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : (
                                <CategoryBreakdown
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    expenses={expenses}
                                    loading={loading}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Expense Graph */}
                    <Card
                        sx={{
                            mb: 8,
                            borderRadius: '16px',
                            minHeight: '300px',
                            maxHeight: '500px',
                            overflow: 'auto',
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <CardContent>
                            {loading ? (
                                <Skeleton variant="rectangular" height={300} />
                            ) : (
                                <ExpenseGraph
                                    selectedMonth={selectedMonth}
                                    mainCategoryTotals={mainCategoryTotals}
                                    subCategoryTotals={subCategoryTotals}
                                    year={year}
                                    expenses={expenses}
                                    loading={loading}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            )}
        </Container>
    );
};

export default ExpenseManagement;