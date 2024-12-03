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
import { apiService } from '../../services/apiService';
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

        const totalAmount = expensesArray.reduce((sum, expense) => {
            const amount = expense.manualTotalAmount || expense.totalAmount || 0;
            const parsedAmount = Number(amount);
            
            return sum + (isNaN(parsedAmount) ? 0 : parsedAmount);
        }, 0);

        const mainCategoryTotals = expensesArray.reduce((acc, expense) => {
            const mainCategory = expense.mainCategory || 'Uncategorized';
            const amount = Number(expense.manualTotalAmount) || 0;
            acc[mainCategory] = (acc[mainCategory] || 0) + amount;
            return acc;
        }, {});

        const subCategoryTotals = expensesArray.reduce((acc, expense) => {
            const subCategory = expense.subCategory || 'Unspecified';
            const amount = Number(expense.manualTotalAmount) || 0;
            acc[subCategory] = (acc[subCategory] || 0) + amount;
            return acc;
        }, {});

        return { 
            totalAmount, 
            mainCategoryTotals, 
            subCategoryTotals 
        };
    };

    const [yearCalculations, setYearCalculations] = useState({
        currentYear: { totalAmount: 0, mainCategoryTotals: {}, subCategoryTotals: {} },
        previousYear: { totalAmount: 0 },
        nextYear: { totalAmount: 0 }
    });

    const fetchYearCalculations = async (targetYear, targetMonth, isCurrentYear = false) => {
        const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString();
        const endDate = new Date(targetYear, targetMonth, 0).toISOString();
      
        try {
            const data = await apiService.getExpensesByDateRange(startDate, endDate);
            if (!Array.isArray(data)) return { totalAmount: 0 };

            if (isCurrentYear) {
                return calculateTotals(data);
            }

            const totalAmount = data.reduce((sum, expense) => {
                const amount = expense.manualTotalAmount || expense.totalAmount || 0;
                return sum + (isNaN(Number(amount)) ? 0 : Number(amount));
            }, 0);

            return { totalAmount };
        } catch (err) {
            console.error(`Failed to fetch expenses for ${targetYear}-${targetMonth}`, err);
            return { totalAmount: 0 };
        }
    };

    useEffect(() => {
        const fetchExpensesForYears = async () => {
            if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
                console.error("Invalid selectedMonth:", selectedMonth);
                return;
            }

            const yearCalculations = {
                currentYear: await fetchYearCalculations(year, selectedMonth, true),
                previousYear: await fetchYearCalculations(year - 1, selectedMonth),
                nextYear: await fetchYearCalculations(year + 1, selectedMonth)
            };

            setYearCalculations(yearCalculations);

            const startDate = new Date(year, selectedMonth - 1, 1).toISOString();
            const endDate = new Date(year, selectedMonth, 0).toISOString();

            setLoading(true);
            try {
                const data = await apiService.getExpensesByDateRange(startDate, endDate);
                if (Array.isArray(data)) {
                    setExpenses(data);
                    setError(null);
                }
            } catch (err) {
                setError("Failed to fetch expense data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExpensesForYears();
    }, [selectedMonth, year]);

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

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24' }}>
                    {error}
                </Alert>
            )}

            {/* Expense Summary, Graph, and Breakdown */}
            {expenses.length === 0 ? (
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 3, backgroundColor: '#e9ecef', borderRadius: '12px' }}>
                    <Typography variant="h6" color="textSecondary">
                        {t('No expenses recorded for')} {selectedMonth}/{year}
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={4} sx={{ display: 'flex', alignItems: 'stretch' }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: 3, flex: '0 0 25%' }}>
                            <CardContent>
                                <ExpenseSummary
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    totalAmount={totalAmount}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: 3, flex: 1 }}>
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
                        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: 3, flex: 1 }}>
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

            {/* Action Buttons */}
            <Box mt={4} display="flex" justifyContent="flex-end">
                <ActionButtons 
                    expenses={expenses}
                    selectedMonth={selectedMonth}
                    year={year}
                    onUpload={apiService.processExpense} 
                />
            </Box>
        </Container>
    );
};

export default ExpenseManagement;
