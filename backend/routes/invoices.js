const express = require('express');
const multer = require('multer');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// הגדר את multer לשימוש בזיכרון
const storage = multer.memoryStorage();
const upload = multer({ storage }).array('additionalFile');
// מסלול לקבלת חשבוניות עם קובץ
// router.post('/getinvoices', upload.array('additionalFiles'), invoiceController.getInvoices);

// מסלול לעיבוד חשבוניות
router.post('/processInvoices', upload, invoiceController.processInvoices);

// מסלול למחיקת חשבונית לפי מזהה
router.delete('/delete_invoice/:invoice_id', invoiceController.deleteInvoice);

router.get('/invoices', invoiceController.getInvoices);

// ייצוא ה-router
module.exports = router;
