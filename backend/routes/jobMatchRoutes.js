// jobMatchRoutes.js - Routes for job matching

const express = require('express');
const { matchJob } = require('../controllers/jobMatchController');

const router = express.Router();

const { rankResumes } = require("../controllers/jobMatchController");

router.post('/match', matchJob);
router.post('/rank', rankResumes);


module.exports = router;

