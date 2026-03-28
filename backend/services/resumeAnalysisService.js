const { extractResumeText } = require('./resumeParserService');
const { extractSkills, extractSkillsFallback } = require('./skillExtractionService');
const { normalizeSkills } = require('./skillNormalizationService');
const { categorizeSkills } = require('./skillCategorizationService');

/**
 * Performs full analysis on a resume file.
 * Uses AI to extract skills, with fallback to regex-based extraction if AI fails.
 * 
 * @param {string} filePath - Path to the resume file.
 * @returns {Promise<{text: string, skills: string[], categorizedSkills: object}>} Analyzed resume data.
 */
async function analyzeResume(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('Invalid file path provided');
    }

    try {
        console.log('[ANALYSIS] Starting resume analysis for:', filePath);

        // Extract text from file
        const extractedText = await extractResumeText(filePath);
        console.log('[ANALYSIS] Resume text extracted:', extractedText.substring(0, 100) + '...');

        let skills = [];

        // Try AI-based skill extraction first
        try {
            console.log('[ANALYSIS] Attempting AI-based skill extraction...');
            skills = await extractSkills(extractedText);
            console.log('[ANALYSIS] AI extraction successful, found skills:', skills);
        } catch (aiError) {
            console.warn('[ANALYSIS] AI skill extraction failed, using fallback method:', aiError.message);
            // Fallback to regex-based extraction
            skills = extractSkillsFallback(extractedText);
            console.log('[ANALYSIS] Fallback extraction completed, found skills:', skills);
        }

        // Normalize and categorize skills
        const normalizedSkills = normalizeSkills(skills);
        console.log('[ANALYSIS] Normalized skills:', normalizedSkills);

        const categorizedSkills = categorizeSkills(normalizedSkills);
        console.log('[ANALYSIS] Categorized skills:', Object.keys(categorizedSkills));

        return {
            text: extractedText,
            skills: normalizedSkills,
            categorizedSkills
        };

    } catch (error) {
        console.error('[ANALYSIS] Resume analysis failed:', error.message);
        throw new Error(`Resume analysis failed: ${error.message}`);
    }
}

module.exports = { analyzeResume };

