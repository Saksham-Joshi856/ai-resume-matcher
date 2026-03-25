// jobMatchRoutes.js - Routes for job matching

const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");
const { matchJob, rankResumes, uploadAndRankResumes } = require('../controllers/jobMatchController');

const router = express.Router();

const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|docx/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        cb(null, allowed.test(ext));
    },
});

router.post('/match', authMiddleware, matchJob);
router.post('/rank', authMiddleware, rankResumes);
router.post("/upload-and-rank", authMiddleware, upload.array("resumes", 10), uploadAndRankResumes);

module.exports = router;

