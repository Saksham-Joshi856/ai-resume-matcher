const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

const { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes } = require("../controllers/resumeController");

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/upload-multiple", upload.array("resumes", 10), uploadMultipleResumes);
router.get("/all", getAllResumes);
router.get("/search", searchResumes);
router.post("/:id/shortlist", toggleShortlist);
router.get("/shortlisted", getShortlistedResumes);

module.exports = router;


