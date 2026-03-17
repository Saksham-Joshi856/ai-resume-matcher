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

const uploadMultipleResumes = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    try {
        let totalUploaded = 0;
        for (const file of req.files) {
            const result = await analyzeResume(file.path);
            const newResume = new Resume({
                name: file.originalname,
                skills: result.skills,
                resumeText: result.text
            });
            await newResume.save();
            totalUploaded++;
        }
        res.json({
            message: "Multiple resumes uploaded successfully",
            totalUploaded
        });
    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({ message: "Error processing resumes" });
    }
};

module.exports = { uploadResume, getAllResumes, uploadMultipleResumes };


