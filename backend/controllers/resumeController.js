const multer = require("multer");
const path = require("path");

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

const uploadResume = (req, res) => {
    upload.single("resume")(req, res, (err) => {
        if (err) return res.status(400).json({ message: "Upload failed" });
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        res.json({ message: "Resume uploaded successfully", filename: req.file.filename });
    });
};

module.exports = { uploadResume };

