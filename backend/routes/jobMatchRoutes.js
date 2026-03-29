// jobMatchRoutes.js - Routes for job matching

const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const authMiddleware = require("../middleware/authMiddleware");
const Resume = require('../models/Resume');
const { matchJob, rankResumes, uploadAndRankResumes, aiMatchCandidates, getResumeInsights } = require('../controllers/jobMatchController');

const router = express.Router();

// ⭐ CUSTOM MIDDLEWARE: Cache-aware rate limiter for insights
// Only rate limits requests that will require OpenRouter API calls (not cached)
// Uses a Map to track non-cached API calls per user/IP
const openAiCallTracker = new Map(); // Track only OpenRouter API calls

const cacheAwareInsightsLimiter = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId || req.ip;
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Validate ID format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(); // Let controller handle invalid ID
        }

        // Check if resume has cached insights
        const resume = await Resume.findById(id);

        if (resume && resume.aiInsights) {
            // ✅ Data is cached - SKIP RATE LIMITING ENTIRELY
            console.log(`[Rate Limiter] ✓ CACHE HIT - Skipping rate limit for: ${resume.name}`);
            return next();
        }

        // ❌ Data not cached - Will call OpenRouter - CHECK RATE LIMIT
        console.log(`[Rate Limiter] 🔄 CACHE MISS - Checking rate limit for new OpenRouter call from user: ${userId}`);

        // Get or create tracker for this user
        if (!openAiCallTracker.has(userId)) {
            openAiCallTracker.set(userId, []);
        }

        const userCalls = openAiCallTracker.get(userId);

        // Remove old calls outside the 1-hour window
        const recentCalls = userCalls.filter(timestamp => timestamp > oneHourAgo);
        openAiCallTracker.set(userId, recentCalls);

        // Check if user has exceeded limit (50 new API calls per hour)
        const MAX_OPENAI_CALLS_PER_HOUR = 50;

        if (recentCalls.length >= MAX_OPENAI_CALLS_PER_HOUR) {
            console.warn(`[Rate Limiter] ❌ Rate limit exceeded for user ${userId}. OpenRouter calls: ${recentCalls.length}/${MAX_OPENAI_CALLS_PER_HOUR}`);
            return res.status(429).json({
                error: 'Rate limited',
                details: `Too many new resume analysis requests (${recentCalls.length}/${MAX_OPENAI_CALLS_PER_HOUR} per hour). Try requesting insights for already-analyzed resumes - cached requests are unlimited!`,
                retryAfter: 3600,
                callsRemaining: 0
            });
        }

        console.log(`[Rate Limiter] ✓ ALLOWED - OpenRouter calls for user: ${recentCalls.length + 1}/${MAX_OPENAI_CALLS_PER_HOUR}`);

        // Store that this user is about to make an API call
        // This will be confirmed in the controller after successful generation
        res.locals.trackOpenAiCall = () => {
            openAiCallTracker.get(userId).push(now);
            console.log(`[Rate Limiter] 📊 Tracked OpenRouter call for user ${userId}. Total: ${openAiCallTracker.get(userId).length}`);
        };

        next();
    } catch (error) {
        console.error('[Rate Limiter] Error in cache check:', error.message);
        // If cache check fails, allow request to proceed
        next();
    }
};

// Rate limiter for AI matching
const aiMatchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 AI match requests per hour per user
    message: 'Too many AI matching requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use userId from auth middleware if available, otherwise use IPv6-safe IP helper
        return req.userId || ipKeyGenerator(req)
    }
});

const uploadPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|docx/;
        const ext = path.extname(file.originalname).toLowerCase().slice(1);
        cb(null, allowed.test(ext));
    },
});

router.post('/match', authMiddleware, matchJob);
router.post('/rank', authMiddleware, rankResumes);
router.post('/ai-match', authMiddleware, aiMatchLimiter, aiMatchCandidates);
router.post("/upload-and-rank", authMiddleware, upload.array("resumes", 10), uploadAndRankResumes);

// GET endpoint for AI resume insights with CACHE-AWARE rate limiting
router.get('/resume-insights/:id', authMiddleware, cacheAwareInsightsLimiter, getResumeInsights);

module.exports = router;

