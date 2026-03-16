// jobMatchRoutes.js - Routes for job matching

const express = require('express');
const { matchJob } = require('../controllers/jobMatchController');

const router = express.Router();

router.post('/match', matchJob);

module.exports = router;

