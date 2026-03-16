// jobMatchController.js - Controller for job matching analysis

const { extractJobSkills } = require('../services/jobSkillExtractionService');
const { calculateMatchScore } = require('../services/jobMatchingService');

async function matchJob(req, res) {
    try {
        const { jobDescription, resumeSkills } = req.body;

        if (!jobDescription || !resumeSkills) {
            return res.status(400).json({ error: 'jobDescription and resumeSkills are required' });
        }

        const jobSkills = extractJobSkills(jobDescription);
        const result = calculateMatchScore(resumeSkills, jobSkills);

        res.json({
            message: "Job match analysis complete",
            result: {
                ...result,
                jobSkills
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { matchJob };

