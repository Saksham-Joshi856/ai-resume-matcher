// jobSkillExtractionService.js - Extracts technical skills from job description

const commonTechSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'MySQL',
    'Python',
    'Java',
    'C++',
    'HTML',
    'CSS',
    'Git',
    'Docker',
    'AWS'
];

function extractJobSkills(jobDescription) {
    if (!jobDescription || typeof jobDescription !== 'string') {
        return [];
    }

    const lowerJobDesc = jobDescription.toLowerCase();
    const detectedSkills = [];

    commonTechSkills.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (lowerJobDesc.includes(lowerSkill)) {
            detectedSkills.push(lowerSkill);
        }
    });

    return detectedSkills;
}

module.exports = { extractJobSkills };

