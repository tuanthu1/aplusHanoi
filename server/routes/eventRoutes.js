// FILE: routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');

router.get('/', EventController.getAllEvents);

module.exports = router;