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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model('Resume', resumeSchema);

