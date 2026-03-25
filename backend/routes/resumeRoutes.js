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

const { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes } = require("../controllers/resumeController");

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);
router.post("/upload-multiple", authMiddleware, upload.array("resumes", 10), uploadMultipleResumes);
router.get("/all", authMiddleware, getAllResumes);
router.get("/search", authMiddleware, searchResumes);
router.patch("/shortlist/:id", authMiddleware, toggleShortlist);
router.post("/:id/shortlist", authMiddleware, toggleShortlist);
router.get("/shortlisted", authMiddleware, getShortlistedResumes);

module.exports = router;


