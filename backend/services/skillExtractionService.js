// Predefined list of common technical skills
const commonSkills = [
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

/**
 * Extracts technical skills from resume text.
 * @param {string} resumeText - The raw resume text.
 * @returns {string[]} Array of detected skills in lowercase.
 */
function extractSkills(resumeText) {
    if (!resumeText || typeof resumeText !== 'string') {
        return [];
    }

    const lowerResume = resumeText.toLowerCase();
    const detectedSkills = [];

    commonSkills.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (lowerResume.includes(lowerSkill)) {
            detectedSkills.push(lowerSkill);
        }
    });

    return detectedSkills;
}

module.exports = { extractSkills };

