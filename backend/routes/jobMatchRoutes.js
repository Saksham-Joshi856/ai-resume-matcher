// jobMatchRoutes.js - Routes for job matching

const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { matchJob, rankResumes, uploadAndRankResumes } = require('../controllers/jobMatchController');

const router = express.Router();

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|docx/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        cb(null, allowed.test(ext));
    },
});

router.post('/match', matchJob);
router.post('/rank', rankResumes);
router.post("/upload-and-rank", upload.array("resumes", 10), uploadAndRankResumes);

module.exports = router;

