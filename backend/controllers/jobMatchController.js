// jobMatchController.js - Controller for job matching analysis

const { extractJobSkills } = require('../services/jobSkillExtractionService');
const { calculateMatchScore } = require('../services/jobMatchingService');
const { generateSuggestions } = require('../services/suggestionService');
const { normalizeSkills } = require('../services/skillNormalizationService');
const { analyzeResume } = require('../services/resumeAnalysisService');

async function matchJob(req, res) {
    try {
        const { jobDescription, resumeSkills } = req.body;

        if (!jobDescription || !resumeSkills) {
            return res.status(400).json({ error: 'jobDescription and resumeSkills are required' });
        }

        const jobSkills = extractJobSkills(jobDescription);
        const normalizedResumeSkills = normalizeSkills(resumeSkills);
        const normalizedJobSkills = normalizeSkills(jobSkills);
        const result = calculateMatchScore(normalizedResumeSkills, normalizedJobSkills);
        const suggestionResult = generateSuggestions(result.missingSkills);

        res.json({
            message: "Job match analysis complete",
            result: {
                ...result,
                normalizedJobSkills,
                suggestions: suggestionResult.suggestions
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

const Resume = require('../models/Resume');

const rankResumes = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ error: 'jobDescription is required' });
        }

        const jobSkills = jobDescription.toLowerCase().split(" ");
        const resumes = await Resume.find({ userId: req.userId }, 'name skills');
        const results = [];

        for (const resume of resumes) {
            const lowerResumeSkills = resume.skills.map(s => s.toLowerCase());
            const matchedSkills = jobSkills.filter(skill => lowerResumeSkills.includes(skill.trim())).map(s => s.trim());
            const missingSkills = jobSkills.filter(skill => !lowerResumeSkills.includes(skill.trim())).map(s => s.trim());
            const matchScore = Math.round((matchedSkills.length / (jobSkills.length || 1)) * 100);
            const suggestions = missingSkills.map(skill => `Add ${skill} experience`);

            results.push({
                name: resume.name,
                matchScore,
                matchedSkills,
                missingSkills,
                suggestions
            });
        }

        results.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            message: "Candidates ranked successfully",
            data: results
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const uploadAndRankResumes = async (req, res) => {
    console.log("FILES RECEIVED:", req.files);
    console.log("BODY RECEIVED:", req.body);
    if (!req.files || req.files.length === 0) {
        console.error("No files received:", req.files);
        return res.status(400).json({ message: "No files uploaded" });
    }
    if (!req.body.jobDescription) {
        return res.status(400).json({ error: "Job description is required" });
    }
    try {
        const jobDescription = req.body.jobDescription;

        const jobSkills = extractJobSkills(jobDescription);
        const normalizedJobSkills = normalizeSkills(jobSkills);
        const rankedResumes = [];

        for (const file of req.files) {
            const result = await analyzeResume(file.path);
            const resumeSkills = result.skills;
            const matchResult = calculateMatchScore(resumeSkills, normalizedJobSkills);
            const matchedSkills = normalizedJobSkills.filter(skill => resumeSkills.includes(skill));
            const missingSkills = normalizedJobSkills.filter(skill => !resumeSkills.includes(skill));
            const suggestions = missingSkills.map(skill => {
                if (skill.includes("react")) return "Build React projects with components and hooks";
                if (skill.includes("node")) return "Create backend APIs using Node.js and Express";
                if (skill.includes("mongo")) return "Practice MongoDB queries and schema design";
                return `Improve knowledge in ${skill}`;
            });
            const newResume = new Resume({
                name: file.originalname,
                skills: result.skills,
                resumeText: result.text,
                matchScore: matchResult.matchScore,
                userId: req.userId
            });
            await newResume.save();
            rankedResumes.push({
                name: file.originalname,
                matchScore: matchResult.matchScore,
                matchedSkills,
                missingSkills,
                suggestions
            });
        }

        rankedResumes.sort((a, b) => b.matchScore - a.matchScore);

        const topCandidate = rankedResumes[0];

        res.json({
            message: "Upload and ranking complete",
            topCandidate,
            rankedResumes
        });

    } catch (error) {
        console.error('Upload and rank error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// AI Candidate Matching - Returns matching resumes ranked by score
const aiMatchCandidates = async (req, res) => {
    try {
        const { jobDescription, filterByNames } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ error: 'jobDescription is required' });
        }

        // Extract skills from job description
        const jobSkills = extractJobSkills(jobDescription);
        const normalizedJobSkills = normalizeSkills(jobSkills);

        // Build query for authenticated user
        let query = { userId: req.userId };
        let resumes = [];

        // STEP 2: If specific resume names are provided, filter by those only
        if (filterByNames && Array.isArray(filterByNames) && filterByNames.length > 0) {
            console.log(`[AI Match] STEP 1: Using filterByNames - Analyzing ${filterByNames.length} specific resume(s)`, filterByNames);
            query.name = { $in: filterByNames };
            resumes = await Resume.find(query).sort({ createdAt: -1 });
        } else {
            // FALLBACK: If no filterByNames provided, fetch only the latest uploaded resumes
            console.log(`[AI Match] STEP 1: No filterByNames provided - Fetching latest resumes`);
            resumes = await Resume.find(query)
                .sort({ createdAt: -1 }) // Sort by creation date, newest first
                .limit(10); // Limit to 10 latest resumes
            console.log(`[AI Match] STEP 2: Fetched ${resumes.length} latest resumes (limited to 10)`);
        }

        // STEP 3: Log which resumes are being analyzed
        const resumeNames = resumes.map(r => ({
            name: r.name,
            fileName: r.fileName,
            createdAt: r.createdAt || r.uploadedAt,
            id: r._id
        }));
        console.log(`[AI Match] STEP 3: Resumes being analyzed:`, JSON.stringify(resumeNames, null, 2));

        if (resumes.length === 0) {
            console.log(`[AI Match] ⚠️  No resumes found for matching`);
            return res.json({
                message: 'No resumes found',
                data: []
            });
        }

        // STEP 3: Calculate match scores for each resume with deduplication by NAME (not by ID)
        // Use resume NAME as the key since the same resume can have multiple MongoDB entries
        const matchResultsMap = new Map();

        let processedCount = 0;
        let skippedCount = 0;

        for (const resume of resumes) {
            try {
                // ⭐ IMPORTANT: Deduplicate by RESUME NAME, not by _id
                // This prevents the same resume from appearing multiple times
                if (matchResultsMap.has(resume.name)) {
                    console.log(`[AI Match] ⚠️  SKIPPING DUPLICATE by name: ${resume.name} (ID: ${resume._id})`);
                    skippedCount++;
                    continue;
                }

                const matchResult = calculateMatchScore(resume.skills, normalizedJobSkills);
                const score = Math.round(matchResult.matchScore);

                // Store using resume NAME as key to prevent duplicates
                matchResultsMap.set(resume.name, {
                    resume: resume.name,
                    fileName: resume.name,
                    score: score,
                    resumeId: resume._id,
                    matchedSkills: matchResult.matchedSkills,
                    missingSkills: matchResult.missingSkills
                });

                processedCount++;
                console.log(`[AI Match] ✓ Analyzed: ${resume.name} - Score: ${score}%`);
            } catch (error) {
                console.error(`[AI Match] ✗ Error processing resume ${resume.name}:`, error.message);
                skippedCount++;
                // Continue processing other resumes
            }
        }

        console.log(`[AI Match] Processing Summary - Processed: ${processedCount}, Skipped Duplicates: ${skippedCount}, Total in DB: ${resumes.length}`);

        // Convert Map to array and sort by score (descending)
        const matchResults = Array.from(matchResultsMap.values())
            .sort((a, b) => b.score - a.score);

        console.log(`[AI Match] STEP 4: Deduplication Complete - Found ${matchResults.length} UNIQUE resumes (reduced from ${resumes.length} database entries)`);
        console.log(`[AI Match] STEP 5: Final Results (sorted by score):`);
        matchResults.forEach((r, idx) => {
            console.log(`  ${idx + 1}. ${r.resume} - Score: ${r.score}%`);
        });

        res.json({
            message: 'Candidates matched successfully',
            data: matchResults
        });
    } catch (error) {
        console.error('AI Match error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

// Get AI-Generated Resume Insights
const getResumeInsights = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate resume ID format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: 'Invalid resume ID format' });
        }

        // STEP 1: Fetch resume from database
        const resume = await Resume.findById(id);

        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }

        // Verify authorization - resume belongs to authenticated user
        if (resume.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized access to this resume' });
        }

        // ⭐ STEP 2: CHECK DATABASE CACHE FIRST - Return cached insights if available
        if (resume.aiInsights) {
            console.log(`[Resume Insights] ✓ CACHE HIT - Returning cached insights for: ${resume.name}`);
            try {
                const cachedInsights = JSON.parse(resume.aiInsights);
                return res.json({
                    message: 'Resume insights retrieved from cache',
                    resumeId: id,
                    resumeName: resume.name,
                    skills: cachedInsights.skills || [],
                    strengths: cachedInsights.strengths || '',
                    missingSkills: cachedInsights.missingSkills || [],
                    experience: cachedInsights.experience || '',
                    recommendation: cachedInsights.recommendation || '',
                    topSkills: cachedInsights.topSkills || '',
                    cached: true,
                    cachedAt: resume.aiInsightsGeneratedAt,
                    skipOpenAI: true
                });
            } catch (parseError) {
                console.warn('[Resume Insights] ⚠️ Cached insights couldn\'t be parsed, regenerating...');
                // Continue to regenerate if cache is corrupted
            }
        }

        console.log(`[Resume Insights] 🔄 CACHE MISS - Calling OpenRouter for: ${resume.name} (ID: ${id})`);

        // STEP 3: Prepare prompt for OpenRouter
        const prompt = `Analyze the following resume and provide structured insights in JSON format.

Resume Name: ${resume.name}

Resume Text:
${resume.resumeText}

Please provide the analysis in exactly this JSON format (no markdown, just raw JSON):
{
  "skills": ["skill1", "skill2", "skill3"],
  "strengths": "Summary of candidate's key strengths (2-3 sentences)",
  "missingSkills": ["missing_skill1", "missing_skill2"],
  "experience": "Overall experience level assessment (Junior/Mid-Level/Senior)",
  "recommendation": "Overall recommendation about this candidate (2-3 sentences)",
  "topSkills": "Top 3 most valuable skills separated by commas"
}

Return ONLY the JSON object, no additional text.`;

        // STEP 4: Call OpenRouter API (only if not cached)
        const { openai } = require('../utils/openaiClient');

        const response = await openai.chat.completions.create({
            model: 'openrouter/free',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert recruiter and career counselor. Analyze resumes and provide structured, accurate insights.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        // Extract the response content
        if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
            console.error('[Resume Insights] Invalid response structure from OpenRouter');
            console.error('[Resume Insights] Response:', JSON.stringify(response));
            throw new Error('Invalid response structure from OpenRouter');
        }

        const aiResponse = response.choices[0].message.content.trim();

        if (!aiResponse) {
            console.error('[Resume Insights] Empty response content from OpenRouter');
            throw new Error('Empty response from OpenRouter');
        }

        console.log(`[Resume Insights] Raw OpenRouter Response:`, aiResponse.substring(0, 200));

        // STEP 5: Parse OpenRouter response as JSON
        let insights;
        try {
            insights = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('[Resume Insights] Failed to parse OpenRouter response as JSON:', parseError.message);

            // Fallback: try to extract and fix incomplete JSON
            const jsonMatch = aiResponse.match(/\{[\s\S]*/);
            if (jsonMatch) {
                let jsonStr = jsonMatch[0];

                // Count braces to find where JSON ends
                let openBraces = (jsonStr.match(/\{/g) || []).length;
                let closeBraces = (jsonStr.match(/\}/g) || []).length;

                // Add missing closing braces
                while (closeBraces < openBraces) {
                    jsonStr += '}';
                    closeBraces++;
                }

                console.log('[Resume Insights] Attempting to parse fixed JSON...');
                try {
                    insights = JSON.parse(jsonStr);
                } catch (fixError) {
                    console.error('[Resume Insights] Still failed after fix:', fixError.message);
                    throw new Error('Could not parse OpenRouter response');
                }
            } else {
                throw new Error('Could not parse OpenRouter response');
            }
        }

        // Validate the insights structure
        if (!insights.skills || !insights.strengths || !insights.recommendation) {
            console.warn('[Resume Insights] ⚠️  Incomplete insights from OpenRouter, providing defaults');
            insights = {
                skills: insights.skills || resume.skills || [],
                strengths: insights.strengths || 'Unable to generate strengths analysis',
                missingSkills: insights.missingSkills || [],
                experience: insights.experience || 'Not determined',
                recommendation: insights.recommendation || 'Unable to generate recommendation',
                topSkills: insights.topSkills || 'N/A'
            };
        }

        // ⭐ STEP 6: SAVE INSIGHTS TO DATABASE CACHE
        resume.aiInsights = JSON.stringify(insights);
        resume.aiInsightsGeneratedAt = new Date();
        await resume.save();

        // ⭐ STEP 7: TRACK THIS OPENROUTER API CALL (for rate limiting non-cached requests)
        if (res.locals.trackOpenAiCall) {
            res.locals.trackOpenAiCall();
        }

        console.log(`[Resume Insights] 💾 Insights saved to database cache for: ${resume.name}`);

        // STEP 7: Return response with cache flag
        res.json({
            message: 'Resume insights generated successfully',
            resumeId: id,
            resumeName: resume.name,
            skills: insights.skills || [],
            strengths: insights.strengths || '',
            missingSkills: insights.missingSkills || [],
            experience: insights.experience || '',
            recommendation: insights.recommendation || '',
            topSkills: insights.topSkills || '',
            cached: false,
            skipOpenAI: false
        });

    } catch (error) {
        console.error('[Resume Insights] Error:', error.message);
        console.error('[Resume Insights] Full Error:', error);

        // Handle OpenRouter API errors
        if (error.status === 401 || error.status === 403) {
            return res.status(503).json({
                error: 'OpenRouter API configuration error',
                details: 'Invalid, missing, or expired API key'
            });
        }

        if (error.status === 405) {
            return res.status(503).json({
                error: 'OpenRouter API error',
                details: 'API endpoint error - check your API key validity'
            });
        }

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Rate limited',
                details: 'Too many requests to OpenRouter. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to generate resume insights',
            details: error.message
        });
    }
};

module.exports = { matchJob, rankResumes, uploadAndRankResumes, aiMatchCandidates, getResumeInsights };

