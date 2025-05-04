const express = require('express');
const router = express.Router();
const { requestWithdraw } = require('../controllers/withdrawController');
const auth = require('../middleware/auth');

router.post('/request', auth, requestWithdraw);

module.exports = router;