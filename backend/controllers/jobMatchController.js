// jobMatchController.js - Controller for job matching analysis

const { extractJobSkills } = require('../services/jobSkillExtractionService');
const { calculateMatchScore } = require('../services/jobMatchingService');
const { generateSuggestions } = require('../services/suggestionService');
const { normalizeSkills } = require('../services/skillNormalizationService');

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

        const jobSkills = extractJobSkills(jobDescription);
        const normalizedJobSkills = normalizeSkills(jobSkills);
        const resumes = await Resume.find({}, 'name skills');
        const results = [];

        for (const resume of resumes) {
            const result = calculateMatchScore(resume.skills, normalizedJobSkills);
            results.push({
                name: resume.name,
                matchScore: result.matchScore
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

module.exports = { matchJob, rankResumes };

