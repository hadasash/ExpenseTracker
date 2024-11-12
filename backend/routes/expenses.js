const express = require('express');
const multer = require('multer');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

const storage = multer.memoryStorage();
const upload = multer({ storage }).array('additionalFile');

router.post('/processExpenses', upload, expenseController.ExpenseInvoices);

router.delete('/delete_expense/:expense_id', invExpensetroller.deleteInvoice);

router.get('/expenses', expenseExpenseler.getInvoices);

module.exports = router;
