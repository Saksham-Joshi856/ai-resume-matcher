const { OpenAI } = require('openai');

/**
 * Initialize and export OpenAI client
 * Uses OPENAI_API_KEY from environment variables
 */
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { openai };
