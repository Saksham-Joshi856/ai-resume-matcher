require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")
const rateLimit = require("express-rate-limit")
const { ipKeyGenerator } = require("express-rate-limit")

const app = express()

// Initialize rate limiters
const generalLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
})

const aiInsightsLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // Limit each user to 15 resume insights requests per hour (to prevent OpenRouter rate limit)
    message: 'Too many resume insights requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use userId from auth middleware if available, otherwise use IPv6-safe IP helper
        return req.userId || ipKeyGenerator(req)
    }
})

const aiMatchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each user to 30 AI matching requests per hour
    message: 'Too many AI matching requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use userId from auth middleware if available, otherwise use IPv6-safe IP helper
        return req.userId || ipKeyGenerator(req)
    }
})

console.log('[SERVER] Rate limiters initialized')
console.log('[SERVER] Loading routes...')

let resumeRoutes, jobMatchRoutes, authRoutes;

try {
    resumeRoutes = require("./routes/resumeRoutes")
    console.log('[SERVER] ✅ Resume routes loaded successfully')
} catch (err) {
    console.error('[SERVER] ❌ Error loading resume routes:', err.message)
    process.exit(1)
}

try {
    jobMatchRoutes = require("./routes/jobMatchRoutes")
    console.log('[SERVER] ✅ Job routes loaded successfully')
} catch (err) {
    console.error('[SERVER] ❌ Error loading job routes:', err.message)
}

try {
    authRoutes = require("./routes/authRoutes")
    console.log('[SERVER] ✅ Auth routes loaded successfully')
} catch (err) {
    console.error('[SERVER] ❌ Error loading auth routes:', err.message)
}

const mongoose = require("mongoose")

app.use(cors())
app.use(express.json())
app.use(generalLimiter) // Apply general rate limiter to all routes

console.log('[SERVER] Middleware configured: CORS, JSON Parser, General Rate Limiter')

// Serve uploaded files as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
console.log('[SERVER] Static files route registered: /uploads')

// Mount routes
if (resumeRoutes) {
    app.use("/api/resume", resumeRoutes)
    console.log('[SERVER] ✅ Resume routes MOUNTED at /api/resume')
} else {
    console.error('[SERVER] ❌ Resume routes NOT available')
}

if (jobMatchRoutes) {
    app.use("/api/ai", jobMatchRoutes)
    console.log('[SERVER] ✅ Job routes MOUNTED at /api/ai')
}

if (authRoutes) {
    app.use("/api/auth", authRoutes)
    console.log('[SERVER] ✅ Auth routes MOUNTED at /api/auth')
}

app.get("/", (req, res) => {
    res.json({ message: "AI Resume Matcher API running" })
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume_matcher'

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
