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

        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category;
            acc[category] = (acc[category] || 0) + expense.totalAmount;
            return acc;
        }, {});

        return { totalAmount, categoryTotals };
    };

    const { totalAmount, categoryTotals } = calculateTotals();

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
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mt: 3 }}>
                    <Typography variant="h6" color="textSecondary">
                        No expenses recorded for {selectedMonth}/{year}.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardContent>
                                <ExpenseSummary
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    totalAmount={totalAmount}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardContent>
                                <ExpenseGraph
                                    selectedMonth={selectedMonth}
                                    categoryTotals={categoryTotals}
                                    year={year}
                                    expenses={expenses}
                                    loading={loading}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Card elevation={3}>
                            <CardContent>
                                <CategoryBreakdown
                                    selectedMonth={selectedMonth}
                                    year={year}
                                    categoryTotals={categoryTotals}
                                    loading={loading}
                                    expenses={expenses}
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