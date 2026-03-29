const { openai } = require('../utils/openaiClient');

/**
 * Extracts technical skills from resume text using OpenRouter API.
 * Falls back to basic extraction if AI fails.
 * 
 * @param {string} resumeText - The raw resume text.
 * @returns {Promise<string[]>} Array of detected technical skills.
 */
async function extractSkills(resumeText) {
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
        console.log('[SKILL_EXTRACTION] Empty resume text provided');
        return [];
    }

    try {
        console.log('[SKILL_EXTRACTION] Calling OpenRouter API to extract skills...');

        // Truncate resume text to avoid exceeding token limits
        const maxChars = 3000;
        const truncatedText = resumeText.length > maxChars
            ? resumeText.substring(0, maxChars) + '...'
            : resumeText;

        const response = await openai.chat.completions.create({
            model: 'meta-llama/llama-3-8b-instruct:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert recruiter analyzing resumes. Extract technical skills from the provided resume text. Return only a valid JSON array of skill names as strings. Do not include soft skills or personal qualities.'
                },
                {
                    role: 'user',
                    content: `Extract all technical skills from this resume text. Return ONLY a JSON array of skills, nothing else:\n\n${truncatedText}`
                }
            ],
            temperature: 0.3, // Low temperature for consistent, factual extraction
            max_tokens: 500,
        });

        const content = response.choices[0].message.content.trim();
        console.log('[SKILL_EXTRACTION] OpenRouter Response:', content);

        // Parse the JSON response
        let skills = [];
        try {
            // Try to extract JSON array from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                skills = JSON.parse(jsonMatch[0]);
            } else {
                skills = JSON.parse(content);
            }
        } catch (parseError) {
            console.warn('[SKILL_EXTRACTION] Failed to parse OpenRouter response as JSON:', parseError.message);
            console.log('[SKILL_EXTRACTION] Raw response:', content);
            return []; // Return empty array if parsing fails
        }

        // Validate and clean skills array
        if (!Array.isArray(skills)) {
            console.warn('[SKILL_EXTRACTION] OpenRouter response is not an array:', skills);
            return [];
        }

        // Convert all skills to strings and remove duplicates
        const cleanedSkills = [...new Set(
            skills
                .map(skill => String(skill).trim())
                .filter(skill => skill.length > 0)
                .map(skill => skill.toLowerCase())
        )];

        console.log('[SKILL_EXTRACTION] Extracted skills:', cleanedSkills);
        return cleanedSkills;

    } catch (error) {
        console.error('[SKILL_EXTRACTION] OpenRouter API error:', error.message);
        console.error('[SKILL_EXTRACTION] Error details:', error);

        // Return empty array and let the error propagate
        // so the controller can handle it appropriately
        throw new Error(`Failed to extract skills using AI: ${error.message}`);
    }
}

/**
 * Fallback skill extraction using regex (for when API fails)
 * @param {string} resumeText - The raw resume text.
 * @returns {string[]} Array of detected skills.
 */
function extractSkillsFallback(resumeText) {
    if (!resumeText || typeof resumeText !== 'string') {
        return [];
    }

    // Fallback list of common technical skills
    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
        'MongoDB', 'MySQL', 'PostgreSQL', 'Python', 'Java', 'C++',
        'HTML', 'CSS', 'Git', 'Docker', 'AWS', 'Azure', 'GCP',
        'Vue', 'Angular', 'Next.js', 'Django', 'Flask', 'Spring',
        'GraphQL', 'REST', 'SQL', 'NoSQL', 'Kubernetes', 'Jenkins'
    ];

    const lowerResume = resumeText.toLowerCase();
    const detectedSkills = [];

    commonSkills.forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        if (lowerResume.includes(lowerSkill)) {
            detectedSkills.push(lowerSkill);
        }
    });

    return [...new Set(detectedSkills)]; // Remove duplicates
}

module.exports = { extractSkills, extractSkillsFallback };

