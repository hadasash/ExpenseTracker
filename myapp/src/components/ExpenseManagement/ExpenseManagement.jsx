import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Alert, Typography, Paper, Card, CardContent } from '@mui/material';
import YearTabs from './YearTabs';
import ExpenseSummary from './ExpenseSummary';
import ExpenseGraph from './ExpenseGraph';
import CategoryBreakdown from './CategoryBreakdown';
import ActionButtons from './ActionButtons';
import { apiService } from '../../services/apiService';

const ExpenseManagement = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(2024);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!selectedMonth) return;

            setLoading(true);
            try {
                const data = await apiService.getExpensesByMonth(year, selectedMonth);
                setExpenses(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch expense data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [selectedMonth, year]);

    const calculateTotals = () => {
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

        const mainCategoryTotals = expenses.reduce((acc, expense) => {
            const mainCategory = expense.mainCategory;
            acc[mainCategory] = (acc[mainCategory] || 0) + expense.totalAmount;
            return acc;
        }, {});

        const subCategoryTotals = expenses.reduce((acc, expense) => {
            const subCategory = expense.subCategory;
            acc[subCategory] = (acc[subCategory] || 0) + expense.totalAmount;
            return acc;
        }, {});

        return { totalAmount, mainCategoryTotals, subCategoryTotals };
    };

    const { totalAmount, mainCategoryTotals, subCategoryTotals } = calculateTotals();

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Year and Month Tabs */}
            <YearTabs
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                setYear={setYear}
            />

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Expense Summary, Graph, and Breakdown */}
            {expenses.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', mt: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <Typography variant="h6" color="textSecondary">
                        No expenses recorded for {selectedMonth}/{year}.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ mb: 3,  borderRadius: '8px' }}>
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

                    <Grid item xs={12} md={6}>
                        <Card sx={{ mb: 3,  borderRadius: '8px' }}>
                            <CardContent>
                                <ExpenseSummary
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    totalAmount={totalAmount}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3,  borderRadius: '8px' }}>
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
                <ActionButtons onUpload={apiService.processExpense} />
            </Box>
        </Container>
    );
};

export default ExpenseManagement;
