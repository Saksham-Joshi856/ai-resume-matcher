const { OpenAI } = require('openai');

/**
 * Initialize and export OpenRouter client
 * Uses OPENROUTER_API_KEY from environment variables
 * OpenRouter is compatible with OpenAI SDK
 */
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'https://ai-resume-matcher.local',
        'X-OpenRouter-Title': 'AI Resume Matcher',
    }
});

module.exports = { openai };
