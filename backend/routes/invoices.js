const express = require('express');
const multer = require('multer');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

const storage = multer.memoryStorage();
const upload = multer({ storage }).any();

router.post('/processInvoices', upload, invoiceController.processInvoices);

router.delete('/delete_invoice/:invoice_id', invoiceController.deleteInvoice);

router.get('/invoices', invoiceController.getInvoices);

module.exports = router;
