const { analyzeResume } = require('../services/resumeAnalysisService');
const Resume = require('../models/Resume');

const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        const result = await analyzeResume(req.file.path);
        const newResume = new Resume({
            name: "Unknown Candidate",
            skills: result.skills,
            resumeText: result.text
        });
        await newResume.save();
        res.json({ message: "Resume processed and saved successfully", skills: result.skills });
    } catch (error) {
        res.status(500).json({ message: "Error processing resume" });
    }
};

const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find();
        res.json({ message: "Resumes fetched successfully", data: resumes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching resumes" });
    }
};

module.exports = { uploadResume, getAllResumes };

