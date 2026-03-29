const { analyzeResume } = require('../services/resumeAnalysisService');
const Resume = require('../models/Resume');

const tokenizeKeywords = (value) =>
    String(value || "")
        .toLowerCase()
        .split(/[\s,]+/)
        .map((token) => token.trim().replace(/^[^\w#+.-]+|[^\w#+.-]+$/g, ""))
        .filter(Boolean);

const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        console.log('[UPLOAD] Processing resume:', req.file.filename);

        // Check if this resume (by original filename) already exists for this user
        const existingResume = await Resume.findOne({
            userId: req.userId,
            name: req.file.originalname
        });

        if (existingResume) {
            console.log(`[UPLOAD] Duplicate detected: ${req.file.originalname} - skipping`);
            return res.status(400).json({
                message: "This resume has already been uploaded. Please upload a different file or modify the filename.",
                isDuplicate: true,
                existingFileName: existingResume.fileName
            });
        }

        const result = await analyzeResume(req.file.path);

        const newResume = new Resume({
            name: req.file.originalname,
            fileName: req.file.filename,
            skills: result.skills,
            resumeText: result.text,
            userId: req.userId
        });

        await newResume.save();
        console.log('[UPLOAD] Resume saved successfully:', newResume._id);

        res.json({
            message: "Resume processed and analyzed successfully",
            skills: result.skills,
            extractionMethod: "AI-powered"
        });
    } catch (error) {
        console.error('[UPLOAD] Error processing resume:', error.message);
        res.status(500).json({
            message: "Error processing resume",
            error: error.message
        });
    }
};

const getAllResumes = async (req, res) => {
    try {
        console.log('[GET_ALL] Fetching resumes for user:', req.userId);
        const resumes = await Resume.find({ userId: req.userId });
        console.log('[GET_ALL] Found', resumes.length, 'resumes');
        res.json({ message: "Resumes fetched successfully", data: resumes });
    } catch (error) {
        console.error('[GET_ALL] Error:', error.message);
        console.error('[GET_ALL] Stack:', error.stack);
        res.status(500).json({
            message: "Error fetching resumes",
            error: error.message
        });
    }
};

const uploadMultipleResumes = async (req, res) => {
    console.log('[UPLOAD_MULTIPLE] Processing files:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    try {
        let totalUploaded = 0;
        let totalFailed = 0;
        let totalDuplicates = 0;
        const uploadedResumes = [];
        const duplicateFiles = [];

        for (const file of req.files) {
            try {
                console.log('[UPLOAD_MULTIPLE] Processing file:', file.filename);

                // Check if this resume (by original filename) already exists for this user
                const existingResume = await Resume.findOne({
                    userId: req.userId,
                    name: file.originalname
                });

                if (existingResume) {
                    console.log(`[UPLOAD_MULTIPLE] Duplicate detected: ${file.originalname} - skipping`);
                    totalDuplicates++;
                    duplicateFiles.push(file.originalname);
                    continue;
                }

                const result = await analyzeResume(file.path);

                const newResume = new Resume({
                    name: file.originalname,
                    fileName: file.filename,
                    skills: result.skills,
                    resumeText: result.text,
                    userId: req.userId
                });

                await newResume.save();

                uploadedResumes.push({
                    fileName: file.filename,
                    originalName: file.originalname,
                    skills: result.skills
                });

                totalUploaded++;
                console.log('[UPLOAD_MULTIPLE] File processed successfully:', file.filename);
            } catch (fileError) {
                totalFailed++;
                console.error(`[UPLOAD_MULTIPLE] Failed to process ${file.filename}:`, fileError.message);
            }
        }

        const response = {
            message: "Resume upload completed",
            totalUploaded,
            totalFailed,
            totalDuplicates,
            extractionMethod: "AI-powered with fallback"
        };

        if (totalUploaded > 0) {
            response.uploadedResumes = uploadedResumes;
        }

        if (totalDuplicates > 0) {
            response.duplicatesSkipped = duplicateFiles;
            response.warning = `${totalDuplicates} duplicate file(s) were skipped`;
        }

        res.json(response);

    } catch (error) {
        console.error('[UPLOAD_MULTIPLE] Error in batch upload:', error.message);
        res.status(500).json({
            message: "Error processing batch upload",
            error: error.message
        });
    }
};

const searchResumes = async (req, res) => {
    try {
        const { skill, name, jobDescription } = req.query;

        const query = { userId: req.userId };
        if (name) {
            query.name = { $regex: name, $options: "i" };
        }
        if (req.query.shortlisted !== undefined) {
            query.shortlisted = req.query.shortlisted === "true";
        }

        let resumes = await Resume.find(query)
            .sort({ uploadedAt: -1 })
            .limit(20)
            .lean();

        if (skill) {
            const keywords = tokenizeKeywords(skill);

            // More lenient matching: match if ANY keyword is found
            resumes = resumes.filter((r) => {
                if (!Array.isArray(r.skills)) return false;

                const normalizedSkills = r.skills.map((s) => String(s).toLowerCase());

                // Partial match: if resume contains any keyword (partial or full)
                return keywords.some((keyword) =>
                    normalizedSkills.some((skill) =>
                        skill.includes(keyword) || keyword.includes(skill)
                    )
                );
            });
        }

        const uniqueMap = new Map();
        resumes.forEach((r) => {
            if (!uniqueMap.has(r.name)) {
                uniqueMap.set(r.name, r);
            }
        });

        let uniqueResumes = Array.from(uniqueMap.values());

        if (jobDescription) {
            const jdSkills = tokenizeKeywords(jobDescription);

            uniqueResumes = uniqueResumes.map((r) => {
                let matchCount = 0;
                const normalizedSkills = Array.isArray(r.skills)
                    ? r.skills.map((s) => String(s).toLowerCase())
                    : [];

                jdSkills.forEach((jdSkill) => {
                    if (normalizedSkills.some((s) => s.includes(jdSkill))) {
                        matchCount++;
                    }
                });

                const score = jdSkills.length
                    ? Math.round((matchCount / jdSkills.length) * 100)
                    : 0;

                return { ...r, matchScore: score };
            });
        }

        uniqueResumes.forEach((r) => {
            if (typeof r.matchScore !== "number") {
                r.matchScore = 0;
            }
        });

        uniqueResumes.sort((a, b) => b.matchScore - a.matchScore);

        console.log('Search results:', uniqueResumes.length, 'resumes with IDs:', uniqueResumes.map(r => r._id).slice(0, 3));

        res.json({
            message: "Search results",
            count: uniqueResumes.length,
            results: uniqueResumes
        });
    } catch (error) {
        console.error('[SEARCH] Error:', error.message);
        console.error('[SEARCH] Stack:', error.stack);
        res.status(500).json({
            message: "Search error",
            error: error.message
        });
    }
};

const toggleShortlist = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[SHORTLIST_TOGGLE] Toggling shortlist for resume:', id, 'user:', req.userId);

        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        resume.shortlisted = !resume.shortlisted;
        await resume.save();
        console.log('[SHORTLIST_TOGGLE] Shortlist updated to:', resume.shortlisted);
        res.json({
            message: "Shortlist updated",
            shortlisted: resume.shortlisted
        });
    } catch (error) {
        console.error('[SHORTLIST_TOGGLE] Error:', error.message);
        console.error('[SHORTLIST_TOGGLE] Stack:', error.stack);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getShortlistedResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ shortlisted: true, userId: req.userId });
        console.log('[SHORTLISTED] Found', resumes.length, 'shortlisted resumes for user:', req.userId);
        res.json({
            message: "Shortlisted resumes",
            results: resumes
        });
    } catch (error) {
        console.error('[SHORTLISTED] Error:', error.message);
        console.error('[SHORTLISTED] Stack:', error.stack);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
const downloadResume = async (req, res) => {
    try {
        const { id } = req.params;
        const fs = require('fs');
        const path = require('path');
        const mongoose = require('mongoose');

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.error('Invalid ObjectId:', id);
            return res.status(400).json({ message: "Invalid resume ID format" });
        }

        console.log('Downloading resume:', id, 'for user:', req.userId);

        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        });

        if (!resume) {
            console.error('Resume not found:', id, 'userId:', req.userId);
            return res.status(404).json({ message: "Resume not found" });
        }

        console.log('Resume found:', resume.fileName);

        if (!resume.fileName) {
            // If no fileName, send the extracted text as a fallback
            console.log('No fileName, returning extracted text');
            return res.json({
                message: "Resume text data",
                fileName: resume.name || "resume",
                text: resume.resumeText,
                format: "text"
            });
        }

        // Try to serve the actual PDF file
        const filePath = path.join(__dirname, '..', 'uploads', resume.fileName);

        console.log('Checking file path:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('PDF file not found:', filePath);
            return res.status(404).json({
                message: "PDF file not found on server",
                fallbackText: resume.resumeText,
                fileName: resume.name
            });
        }

        console.log('Serving file:', filePath);

        // Send the file
        res.download(filePath, resume.fileName || 'resume.pdf', (err) => {
            if (err) {
                console.error('Download error:', err);
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: "Error downloading resume", error: error.message });
    }
};

const addNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note || typeof note !== 'string') {
            return res.status(400).json({ message: "Note content is required" });
        }

        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        resume.notes = note.trim();
        await resume.save();

        res.json({
            message: "Note added successfully",
            notes: resume.notes
        });
    } catch (error) {
        console.error('[ADD_NOTE] Error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

const getNote = async (req, res) => {
    try {
        const { id } = req.params;

        const resume = await Resume.findOne({
            _id: id,
            userId: req.userId
        }).select('notes');

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.json({
            message: "Note retrieved successfully",
            notes: resume.notes || ""
        });
    } catch (error) {
        console.error('[GET_NOTE] Error:', error);
        res.status(500).json({ message: "Server error" });
    }
};

const compareResumes = async (req, res) => {
    try {
        const { resumeIds } = req.body;

        // Validate input
        if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length === 0) {
            return res.status(400).json({ message: "Invalid or empty resumeIds array" });
        }

        // Fetch resumes where _id is in resumeIds and belongs to current user
        const resumes = await Resume.find({
            _id: { $in: resumeIds },
            userId: req.userId
        }).select('name skills matchScore experience projects fileName resumeText uploadedAt notes shortlisted');

        if (resumes.length === 0) {
            return res.status(404).json({ message: "No resumes found" });
        }

        // Return candidate details for comparison
        res.json({
            message: "Resumes fetched successfully for comparison",
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        console.error('[COMPARE] Error:', error.message);
        res.status(500).json({ message: "Error comparing resumes" });
    }
};

module.exports = { uploadResume, getAllResumes, uploadMultipleResumes, searchResumes, toggleShortlist, getShortlistedResumes, downloadResume, addNote, getNote, compareResumes };



