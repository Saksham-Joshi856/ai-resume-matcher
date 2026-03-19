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
        const { skill, name, jobDescription } = req.query;

        const query = {};
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

            resumes = resumes.filter((r) => {
                if (!Array.isArray(r.skills)) return false;

                const normalizedSkills = r.skills.map((s) => String(s).toLowerCase());

                let matchCount = 0;

                keywords.forEach((k) => {
                    if (normalizedSkills.some((s) => s.includes(k))) {
                        matchCount++;
                    }
                });

                return matchCount > 0;
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
        const resume = await Resume.findById(id);
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
        const resumes = await Resume.find({ shortlisted: true });
        res.json({
            message: "Shortlisted resumes",
            results: resumes
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes };



