// jobMatchController.js - Controller for job matching analysis

const { extractJobSkills } = require('../services/jobSkillExtractionService');
const { calculateMatchScore } = require('../services/jobMatchingService');
const { generateSuggestions } = require('../services/suggestionService');
const { normalizeSkills } = require('../services/skillNormalizationService');
const { analyzeResume } = require('../services/resumeAnalysisService');

async function matchJob(req, res) {
    try {
        const { jobDescription, resumeSkills } = req.body;

        if (!jobDescription || !resumeSkills) {
            return res.status(400).json({ error: 'jobDescription and resumeSkills are required' });
        }

        const jobSkills = extractJobSkills(jobDescription);
        const normalizedResumeSkills = normalizeSkills(resumeSkills);
        const normalizedJobSkills = normalizeSkills(jobSkills);
        const result = calculateMatchScore(normalizedResumeSkills, normalizedJobSkills);
        const suggestionResult = generateSuggestions(result.missingSkills);

        res.json({
            message: "Job match analysis complete",
            result: {
                ...result,
                normalizedJobSkills,
                suggestions: suggestionResult.suggestions
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const Resume = require('../models/Resume');

const rankResumes = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ error: 'jobDescription is required' });
        }

        const jobSkills = jobDescription.toLowerCase().split(" ");
        const resumes = await Resume.find({}, 'name skills');
        const results = [];

        for (const resume of resumes) {
            const lowerResumeSkills = resume.skills.map(s => s.toLowerCase());
            const matchedSkills = jobSkills.filter(skill => lowerResumeSkills.includes(skill.trim())).map(s => s.trim());
            const missingSkills = jobSkills.filter(skill => !lowerResumeSkills.includes(skill.trim())).map(s => s.trim());
            const matchScore = Math.round((matchedSkills.length / (jobSkills.length || 1)) * 100);
            const suggestions = missingSkills.map(skill => `Add ${skill} experience`);

            results.push({
                name: resume.name,
                matchScore,
                matchedSkills,
                missingSkills,
                suggestions
            });
        }

        results.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            message: "Candidates ranked successfully",
            data: results
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const uploadAndRankResumes = async (req, res) => {
    console.log("FILES RECEIVED:", req.files);
    console.log("BODY RECEIVED:", req.body);
    if (!req.files || req.files.length === 0) {
        console.error("No files received:", req.files);
        return res.status(400).json({ message: "No files uploaded" });
    }
    if (!req.body.jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
    }
    try {
        const jobDescription = req.body.jobDescription;

        const jobSkills = extractJobSkills(jobDescription);
        const normalizedJobSkills = normalizeSkills(jobSkills);
        const rankedResumes = [];

        for (const file of req.files) {
            const result = await analyzeResume(file.path);
            const resumeSkills = result.skills;
            const matchResult = calculateMatchScore(resumeSkills, normalizedJobSkills);
            const matchedSkills = normalizedJobSkills.filter(skill => resumeSkills.includes(skill));
            const missingSkills = normalizedJobSkills.filter(skill => !resumeSkills.includes(skill));
            const suggestions = missingSkills.map(skill => {
                if (skill.includes("react")) return "Build React projects with components and hooks";
                if (skill.includes("node")) return "Create backend APIs using Node.js and Express";
                if (skill.includes("mongo")) return "Practice MongoDB queries and schema design";
                return `Improve knowledge in ${skill}`;
            });
            const newResume = new Resume({
                name: file.originalname,
                skills: result.skills,
                resumeText: result.text,
                matchScore: matchResult.matchScore
            });
            await newResume.save();
            rankedResumes.push({
                name: file.originalname,
                matchScore: matchResult.matchScore,
                matchedSkills,
                missingSkills,
                suggestions
            });
        }

        rankedResumes.sort((a, b) => b.matchScore - a.matchScore);

        const topCandidate = rankedResumes[0];

        res.json({
            message: "Upload and ranking complete",
            topCandidate,
            rankedResumes
        });

    } catch (error) {
        console.error('Upload and rank error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { matchJob, rankResumes, uploadAndRankResumes };



