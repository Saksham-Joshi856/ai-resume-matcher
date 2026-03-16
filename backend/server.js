require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()
const resumeRoutes = require("./routes/resumeRoutes")
const jobMatchRoutes = require("./routes/jobMatchRoutes")
const mongoose = require("mongoose")

app.use(cors())
app.use(express.json())

app.use("/api/resume", resumeRoutes)
app.use("/api/job", jobMatchRoutes)

app.get("/", (req, res) => {
    res.json({ message: "AI Resume Matcher API running" })
})

const PORT = process.env.PORT || 5000

mongoose.connect('mongodb://127.0.0.1:27017/resumeMatcherDB')
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
