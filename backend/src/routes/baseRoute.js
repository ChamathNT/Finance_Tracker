const express = require('express');

const router = express.Router();

router.use('/user', require('./userRoutes'));
router.use('/budget', require('./budgetRoutes'));
router.use('/goals', require('./goalRoutes'));


module.exports = router;