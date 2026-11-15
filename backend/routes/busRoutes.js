const express = require('express');
const router = express.Router();
const { searchBuses, getBusById, getCities } = require('../controllers/busController');

router.get('/search', searchBuses);
router.get('/cities', getCities);
router.get('/:id', getBusById);

module.exports = router;
