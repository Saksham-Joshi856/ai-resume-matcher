const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: false
    },
    skills: [{
        type: String
    }],
    resumeText: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number,
        default: 0
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    shortlisted: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // STEP 1: Add field to cache AI insights - prevents repeated OpenRouter API calls
    aiInsights: {
        type: String,
        default: null
    },
    aiInsightsGeneratedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true }); // Enable timestamps (createdAt, updatedAt)

module.exports = mongoose.model('Resume', resumeSchema);

