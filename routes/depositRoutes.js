const express = require('express');
const router = express.Router();
const { requestDeposit } = require('../controllers/depositController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/request', auth, upload.single('paymentProof'), requestDeposit);

module.exports = router;