const { analyzeResume } = require('../services/resumeAnalysisService');

const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        const result = await analyzeResume(req.file.path);
        res.json({ message: "Resume processed", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error processing resume" });
    }
};

module.exports = { uploadResume };

