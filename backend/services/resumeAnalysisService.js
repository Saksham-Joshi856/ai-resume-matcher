const { extractResumeText } = require('./resumeParserService');
const { extractSkills } = require('./skillExtractionService');

/**
 * Performs full analysis on a resume file.
 * @param {string} filePath - Path to the resume file.
 * @returns {Promise<{text: string, skills: string[]}>} Analyzed resume data.
 */
async function analyzeResume(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path provided');
    }

    const extractedText = await extractResumeText(filePath);
    const skills = extractSkills(extractedText);

    return {
        text: extractedText,
        skills: skills
    };
}

module.exports = { analyzeResume };

