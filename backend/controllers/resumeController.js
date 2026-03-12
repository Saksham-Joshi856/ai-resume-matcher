const { extractResumeText } = require('../services/resumeParserService');

const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        const extractedText = await extractResumeText(req.file.path);
        res.json({ message: "Resume processed", text: extractedText });
    } catch (error) {
        res.status(500).json({ message: "Error processing resume" });
    }
};

module.exports = { uploadResume };

