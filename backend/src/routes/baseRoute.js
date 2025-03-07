const express = require('express');

const router = express.Router();

router.use('/user', require('./userRoutes'));
router.use('/budget', require('./budgetRoutes'));
router.use('/goals', require('./goalRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/report', require('./reportRoutes'));
router.use('/dash', require('./dashboardRoutes'));



module.exports = router; 