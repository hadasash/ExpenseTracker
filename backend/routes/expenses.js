const express = require('express');
const multer = require('multer');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

const storage = multer.memoryStorage();
const upload = multer({ storage }).array('additionalFile');

router.post('/processExpenses', upload, expenseController.processExpenses);

router.delete('/delete/:expenseId', expenseController.deleteExpense);

router.get('/expenses', expenseController.getExpenses);

router.post('/addExpenseManually', expenseController.addExpenseManually);

router.patch('/:id', expenseController.updateExpense);

module.exports = router;