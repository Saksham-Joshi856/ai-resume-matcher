// jobMatchingService.js - Calculates resume-job match score based on skills

function calculateMatchScore(resumeSkills, jobSkills) {
    if (!Array.isArray(resumeSkills) || !Array.isArray(jobSkills)) {
        return { matchScore: 0, matchedSkills: [], missingSkills: jobSkills || [] };
    }

    const matchedSkills = jobSkills.filter(skill => resumeSkills.includes(skill));
    const missingSkills = jobSkills.filter(skill => !resumeSkills.includes(skill));
    const matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);

    return {
        matchScore,
        matchedSkills,
        missingSkills
    };
}

module.exports = { calculateMatchScore };

