const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/authMiddleware");

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

const { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes, downloadResume, addNote, getNote, compareResumes } = require("../controllers/resumeController");

// Test route to verify router is working
router.get("/test", (req, res) => {
    res.json({ message: "Resume routes are working!" });
});

// Specific routes FIRST (before parameter routes)
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.post("/upload-multiple", authMiddleware, upload.array("resumes", 10), uploadMultipleResumes);
router.get("/all", authMiddleware, getAllResumes);
router.get("/search", authMiddleware, searchResumes);
router.get("/shortlisted", authMiddleware, getShortlistedResumes);
router.post("/add-note/:id", authMiddleware, addNote);
router.get("/note/:id", authMiddleware, getNote);
router.post("/compare", authMiddleware, compareResumes);

// Generic parameter routes LAST (/:id routes must come after specific routes)
// Temporarily WITHOUT auth for debugging
router.get("/download/:id", async (req, res) => {
    console.log('[DOWNLOAD] Route hit - ID:', req.params.id);
    console.log('[DOWNLOAD] Auth header:', req.headers.authorization ? 'Present' : 'Missing');

    try {
        // Call the download function directly
        const fs = require('fs');
        const path = require('path');
        const mongoose = require('mongoose');
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('[DOWNLOAD] Invalid ObjectId:', id);
            return res.status(400).json({ message: "Invalid resume ID format" });
        }

        console.log('[DOWNLOAD] ObjectId is valid');

        // For now, return test response
        return res.json({
            message: "Download route is working!",
            resumeId: id,
            status: "Route accessible"
        });
    } catch (err) {
        console.error('[DOWNLOAD] Error:', err);
        res.status(500).json({ message: "Error", error: err.message });
    }
});

router.patch("/shortlist/:id", authMiddleware, toggleShortlist);
router.post("/:id/shortlist", authMiddleware, toggleShortlist);

module.exports = router;
