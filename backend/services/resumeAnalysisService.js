const { extractResumeText } = require('./resumeParserService');
const { extractSkills } = require('./skillExtractionService');
const { normalizeSkills } = require('./skillNormalizationService');
const { categorizeSkills } = require('./skillCategorizationService');

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
    const normalizedSkills = normalizeSkills(skills);
    const categorizedSkills = categorizeSkills(normalizedSkills);

    return {
        text: extractedText,
        skills: normalizedSkills,
        categorizedSkills
    };


}

module.exports = { analyzeResume };

