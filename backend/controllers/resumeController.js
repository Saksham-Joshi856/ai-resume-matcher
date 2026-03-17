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

const searchResumes = async (req, res) => {
    try {
        let query = {};
        const { skill, name, page, limit, sortBy, order } = req.query;
        if (skill) {
            query.skills = { $regex: skill, $options: "i" };
        }
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 5;
        const sortByField = sortBy || "name";
        const sortOrder = order === "desc" ? -1 : 1;
        const skip = (pageNum - 1) * limitNum;
        const results = await Resume.find(query)
            .sort({ [sortByField]: sortOrder })
            .skip(skip)
            .limit(limitNum);
        const total = await Resume.countDocuments(query);
        res.json({
            results,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        res.status(500).json({ message: "Search error" });
    }
};

const toggleShortlist = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findById(id);
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        resume.shortlisted = !resume.shortlisted;
        await resume.save();
        res.json({
            message: "Shortlist status updated",
            shortlisted: resume.shortlisted
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getShortlistedResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ shortlisted: true });
        res.json({ results: resumes });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes };



