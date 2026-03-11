const uploadResume = (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    res.json({ message: "Resume uploaded successfully", filename: req.file.filename });
};

module.exports = { uploadResume };

