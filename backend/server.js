require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

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

console.log('[SERVER] Middleware configured: CORS, JSON Parser')

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
    app.use("/api/job", jobMatchRoutes)
    console.log('[SERVER] ✅ Job routes MOUNTED at /api/job')
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
