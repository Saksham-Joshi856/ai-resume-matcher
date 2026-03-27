const { analyzeResume } = require('../services/resumeAnalysisService');
const Resume = require('../models/Resume');

const tokenizeKeywords = (value) =>
    String(value || "")
        .toLowerCase()
        .split(/[\s,]+/)
        .map((token) => token.trim().replace(/^[^\w#+.-]+|[^\w#+.-]+$/g, ""))
        .filter(Boolean);

const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        const result = await analyzeResume(req.file.path);
        const newResume = new Resume({
            name: "Unknown Candidate",
            fileName: req.file.filename,
            skills: result.skills,
            resumeText: result.text,
            userId: req.userId
        });
        await newResume.save();
        res.json({ message: "Resume processed and saved successfully", skills: result.skills });
    } catch (error) {
        res.status(500).json({ message: "Error processing resume" });
    }
};

const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.userId });
        res.json({ message: "Resumes fetched successfully", data: resumes });
    } catch (error) {
        res.status(500).json({ message: "Error fetching resumes" });
    }
};

const uploadMultipleResumes = async (req, res) => {
    console.log("FILES:", req.files);
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    try {

        let totalUploaded = 0;
        for (const file of req.files) {
            const result = await analyzeResume(file.path);
            const newResume = new Resume({
                name: file.originalname,
                fileName: file.filename,
                skills: result.skills,
                resumeText: result.text,
                userId: req.userId
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
        const { skill, name, jobDescription } = req.query;

        const query = { userId: req.userId };
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        if (req.query.shortlisted !== undefined) {
            query.shortlisted = req.query.shortlisted === "true";
        }

        let resumes = await Resume.find(query)
            .sort({ uploadedAt: -1 })
            .limit(20)
            .lean();

        if (skill) {
            const keywords = tokenizeKeywords(skill);

            // More lenient matching: match if ANY keyword is found
            resumes = resumes.filter((r) => {
                if (!Array.isArray(r.skills)) return false;

                const normalizedSkills = r.skills.map((s) => String(s).toLowerCase());

                // Partial match: if resume contains any keyword (partial or full)
                return keywords.some((keyword) =>
                    normalizedSkills.some((skill) =>
                        skill.includes(keyword) || keyword.includes(skill)
                    )
                );
            });
        }

        const uniqueMap = new Map();
        resumes.forEach((r) => {
            if (!uniqueMap.has(r.name)) {
                uniqueMap.set(r.name, r);
            }
        });

        let uniqueResumes = Array.from(uniqueMap.values());

        if (jobDescription) {
            const jdSkills = tokenizeKeywords(jobDescription);

            uniqueResumes = uniqueResumes.map((r) => {
                let matchCount = 0;
                const normalizedSkills = Array.isArray(r.skills)
                    ? r.skills.map((s) => String(s).toLowerCase())
                    : [];

                jdSkills.forEach((jdSkill) => {
                    if (normalizedSkills.some((s) => s.includes(jdSkill))) {
                        matchCount++;
                    }
                });

                const score = jdSkills.length
                    ? Math.round((matchCount / jdSkills.length) * 100)
                    : 0;

                return { ...(r._doc || r), matchScore: score };
            });
        }

        uniqueResumes.forEach((r) => {
            if (typeof r.matchScore !== "number") {
                r.matchScore = 0;
            }
        });

        uniqueResumes.sort((a, b) => b.matchScore - a.matchScore);

        console.log('Search results:', uniqueResumes.length, 'resumes with IDs:', uniqueResumes.map(r => r._id).slice(0, 3));

        res.json({
            message: "Search results",
            count: uniqueResumes.length,
            results: uniqueResumes
        });
    } catch (error) {
        res.status(500).json({ message: "Search error" });
    }
};

const toggleShortlist = async (req, res) => {
    try {
        const { id } = req.params;
        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        resume.shortlisted = !resume.shortlisted;
        await resume.save();
        res.json({
            message: "Shortlist updated",
            shortlisted: resume.shortlisted
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getShortlistedResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ shortlisted: true, userId: req.userId });
        res.json({
            message: "Shortlisted resumes",
            results: resumes
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const downloadResume = async (req, res) => {
    try {
        const { id } = req.params;
        const fs = require('fs');
        const path = require('path');
        const mongoose = require('mongoose');

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('Invalid ObjectId:', id);
            return res.status(400).json({ message: "Invalid resume ID format" });
        }

        console.log('Downloading resume:', id, 'for user:', req.userId);

        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        });

        if (!resume) {
            console.error('Resume not found:', id, 'userId:', req.userId);
            return res.status(404).json({ message: "Resume not found" });
        }

        console.log('Resume found:', resume.fileName);

        if (!resume.fileName) {
            // If no fileName, send the extracted text as a fallback
            console.log('No fileName, returning extracted text');
            return res.json({
                message: "Resume text data",
                fileName: resume.name || "resume",
                text: resume.resumeText,
                format: "text"
            });
        }

        // Try to serve the actual PDF file
        const filePath = path.join(__dirname, '..', 'uploads', resume.fileName);

        console.log('Checking file path:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('PDF file not found:', filePath);
            return res.status(404).json({
                message: "PDF file not found on server",
                fallbackText: resume.resumeText,
                fileName: resume.name
            });
        }

        console.log('Serving file:', filePath);

        // Send the file
        res.download(filePath, resume.fileName || 'resume.pdf', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: "Error downloading resume", error: error.message });
    }
};
module.exports = { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes, downloadResume };



