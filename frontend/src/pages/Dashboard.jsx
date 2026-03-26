/**
 * Dashboard Page Component
 * Main recruiter dashboard with resume screening and candidate management
 * 
 * Features:
 * - Resume upload functionality
 * - Search candidates by skill
 * - Filter candidates by experience and match score
 * - Display matched candidates results
 * - Interactive candidate cards with actions
 * - Logout functionality with session management
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    // Navigation and routing
    const navigate = useNavigate();

    // State management
    const [stats] = useState({
        resumesProcessed: 1240,
        jobMatches: 89,
        activeShortlists: 12,
        successRate: '94%',
    });

    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedCandidates, setUploadedCandidates] = useState([]);
    const [searchSkill, setSearchSkill] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('all');
    const [matchScore, setMatchScore] = useState('all');
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [shortlistIds, setShortlistIds] = useState(new Set());

    // Handle multiple file uploads
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Add files to existing list (maximum 10 files)
            const newFiles = [...uploadedFiles];
            files.forEach(file => {
                if (newFiles.length < 10 && !newFiles.some(f => f.name === file.name)) {
                    newFiles.push(file);
                }
            });
            setUploadedFiles(newFiles);

            // Show confirmation message
            if (files.length === 1) {
                alert(`File "${files[0].name}" added successfully!`);
            } else {
                alert(`${files.length} files added successfully!`);
            }
        }
    };

    // Remove a file from the upload list
    const handleRemoveFile = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
    };

    // Extract candidate info from resume file (simulating resume parsing)
    const extractCandidateFromResume = (file, index) => {
        // Extract name from filename (e.g., "John_Doe.pdf" -> "John Doe")
        const nameFromFile = file.name
            .replace(/\.[^.]+$/, '') // Remove file extension
            .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
            .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words

        // Common tech skills to match in filenames
        const skillKeywords = {
            'React': ['react', 'jsx'],
            'Node.js': ['node', 'nodejs', 'express'],
            'Python': ['python', 'django', 'flask'],
            'Java': ['java', 'spring'],
            'JavaScript': ['javascript', 'js'],
            'TypeScript': ['typescript', 'ts'],
            '.NET': ['dotnet', '.net', 'csharp', 'c#'],
            'SQL': ['sql', 'mysql', 'postgres', 'database'],
            'AWS': ['aws', 'amazon'],
            'DevOps': ['devops', 'docker', 'kubernetes'],
        };

        // Find skills in filename
        const filenameForSearch = file.name.toLowerCase();
        const matchedSkills = [];
        Object.entries(skillKeywords).forEach(([skill, keywords]) => {
            if (keywords.some(keyword => filenameForSearch.includes(keyword))) {
                matchedSkills.push(skill);
            }
        });

        const skill = matchedSkills.length > 0
            ? matchedSkills[Math.floor(Math.random() * matchedSkills.length)]
            : ['React', 'Node.js', 'Python', 'Java', 'JavaScript'][Math.floor(Math.random() * 5)];

        const experiences = ['Junior', 'Mid-Level', 'Senior'];
        const experience = experiences[Math.floor(Math.random() * experiences.length)];

        // Generate match score (70-98%)
        const match = Math.floor(Math.random() * (98 - 70 + 1) + 70);

        return {
            id: uploadedCandidates.length + index + 1,
            name: nameFromFile || `Candidate ${uploadedCandidates.length + index + 1}`,
            skill,
            experience,
            match,
            fileName: file.name,
        };
    };

    // Handle upload all files
    const handleUploadAll = async () => {
        if (uploadedFiles.length === 0) {
            alert('Please select at least one resume to upload');
            return;
        }

        // Extract candidates from uploaded resumes
        const newCandidates = uploadedFiles.map((file, index) =>
            extractCandidateFromResume(file, index)
        );

        // Add to uploaded candidates
        setUploadedCandidates([...uploadedCandidates, ...newCandidates]);

        // TODO: Implement actual file upload to backend
        // Example: 
        // const formData = new FormData();
        // uploadedFiles.forEach(file => {
        //   formData.append('resumes', file);
        // });
        // await axios.post('http://localhost:5000/api/resumes/upload', formData);

        alert(`${uploadedFiles.length} resume(s) uploaded and parsed successfully! Added ${newCandidates.length} candidate(s) to search pool.`);
        setUploadedFiles([]);
    };

    // Handle search
    const handleSearch = () => {
        if (uploadedCandidates.length === 0) {
            alert('Please upload at least one resume first');
            return;
        }

        if (!searchSkill.trim()) {
            alert('Please enter a skill to search');
            return;
        }

        // Filter candidates based on search criteria - USE UPLOADED CANDIDATES ONLY
        let filteredCandidates = uploadedCandidates.filter(candidate =>
            candidate.skill.toLowerCase().includes(searchSkill.toLowerCase())
        );

        // Apply experience filter
        if (experienceLevel !== 'all') {
            filteredCandidates = filteredCandidates.filter(
                candidate => candidate.experience.toLowerCase() === experienceLevel.toLowerCase()
            );
        }

        // Apply match score filter
        if (matchScore !== 'all') {
            const minScore = parseInt(matchScore);
            filteredCandidates = filteredCandidates.filter(candidate => candidate.match >= minScore);
        }

        setSearchResults(filteredCandidates);
        setHasSearched(true);
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchSkill('');
        setExperienceLevel('all');
        setMatchScore('all');
        setSearchResults([]);
        setHasSearched(false);
    };

    // Handle shortlist toggle
    const toggleShortlist = (candidateId) => {
        const newShortlist = new Set(shortlistIds);
        if (newShortlist.has(candidateId)) {
            newShortlist.delete(candidateId);
        } else {
            newShortlist.add(candidateId);
        }
        setShortlistIds(newShortlist);
    };

    // Handle logout - removes token and redirects to login
    const handleLogout = () => {
        // Remove JWT token from localStorage
        localStorage.removeItem('token');

        // Optional: Remove user info
        localStorage.removeItem('user');

        // Redirect to login page
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Header */}
            <div className="border-b border-gray-700 bg-black bg-opacity-40 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Recruiter Dashboard</h1>
                            <p className="text-gray-400">Upload resumes, search candidates, and shortlist applicants</p>
                        </div>
                        <div className="hidden sm:flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Welcome back</p>
                                <p className="text-lg font-semibold text-white">Recruiter</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                R
                            </div>
                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <span>🚪</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Resumes Processed Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">📄</div>
                            <span className="text-blue-200 text-xs font-semibold">TOTAL</span>
                        </div>
                        <h3 className="text-blue-100 text-sm font-medium mb-1">Resumes Processed</h3>
                        <p className="text-4xl font-bold">{stats.resumesProcessed.toLocaleString()}</p>
                    </div>

                    {/* Job Matches Card */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">🎯</div>
                            <span className="text-green-200 text-xs font-semibold">ACTIVE</span>
                        </div>
                        <h3 className="text-green-100 text-sm font-medium mb-1">Job Matches</h3>
                        <p className="text-4xl font-bold">{stats.jobMatches}</p>
                    </div>

                    {/* Active Shortlists Card */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">⭐</div>
                            <span className="text-purple-200 text-xs font-semibold">ACTIVE</span>
                        </div>
                        <h3 className="text-purple-100 text-sm font-medium mb-1">Active Shortlists</h3>
                        <p className="text-4xl font-bold">{stats.activeShortlists}</p>
                    </div>

                    {/* Success Rate Card */}
                    <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-4xl">📈</div>
                            <span className="text-orange-200 text-xs font-semibold">RATE</span>
                        </div>
                        <h3 className="text-orange-100 text-sm font-medium mb-1">Match Success Rate</h3>
                        <p className="text-4xl font-bold">{stats.successRate}</p>
                    </div>
                </div>

                {/* Dashboard Tools Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-8">Recruitment Tools</h2>

                    {/* Row 1: Upload and Search Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {/* Card 1: Upload Multiple Resumes */}
                        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-300 transition duration-300 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-2xl">📁</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Upload Resumes</h3>
                                    <p className="text-sm text-gray-600 mt-1">{uploadedFiles.length} file(s) selected</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* File Upload Input - Allow Multiple Files */}
                                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-100 transition duration-300 group cursor-pointer">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        multiple
                                        className="hidden"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        <div className="text-5xl mb-3 group-hover:scale-110 transition duration-300">📄</div>
                                        <p className="text-gray-700 font-semibold text-lg">
                                            Drag and drop your resumes here
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">or click to select multiple files</p>
                                        <p className="text-xs text-blue-600 font-medium mt-3">PDF, DOC, or DOCX • Max 10 files • Max 10MB each</p>
                                    </label>
                                </div>

                                {/* Uploaded Files List */}
                                {uploadedFiles.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3">Selected Files:</h4>
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-blue-100">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="text-blue-600">📄</span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="ml-2 text-red-600 hover:text-red-700 font-bold text-lg hover:bg-red-100 rounded-lg p-1 transition"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <button
                                    onClick={handleUploadAll}
                                    disabled={uploadedFiles.length === 0}
                                    className={`w-full font-bold py-3 px-4 rounded-lg transition transform flex items-center justify-center gap-2 ${uploadedFiles.length > 0
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <span>⬆️</span> Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}
                                </button>

                                {/* Info Message */}
                                {uploadedFiles.length > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                                        <p className="text-sm text-green-700 font-semibold">✅ Ready to upload {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 2: Search Candidates */}
                        <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-2xl shadow-xl hover:shadow-2xl hover:border-green-300 transition duration-300 p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Search Candidates</h3>
                                    <p className="text-sm font-semibold text-green-600 mt-1">
                                        {uploadedCandidates.length} candidate{uploadedCandidates.length !== 1 ? 's' : ''} in pool
                                    </p>
                                </div>
                            </div>

                            {uploadedCandidates.length === 0 ? (
                                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center">
                                    <p className="text-blue-700 font-semibold text-sm mb-2">📁 Upload resumes first</p>
                                    <p className="text-blue-600 text-xs">Upload resumes using the tool on the left to populate the search candidate pool</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Skill Search Input */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">
                                            Search by Skill
                                        </label>
                                        <input
                                            type="text"
                                            value={searchSkill}
                                            onChange={(e) => setSearchSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="e.g., React, Python, Node.js"
                                            className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition shadow-sm hover:border-green-300"
                                        />
                                    </div>

                                    {/* Search Button */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleSearch}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                        >
                                            <span>🚀</span> Search
                                        </button>
                                        {hasSearched && (
                                            <button
                                                onClick={handleClearSearch}
                                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
                                            >
                                                <span>✕</span> Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Search Results Count */}
                                    {hasSearched && (
                                        <div className={`rounded-lg p-4 text-center font-semibold text-sm transition duration-300 ${searchResults.length > 0 ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-orange-100 border border-orange-300 text-orange-700'}`}>
                                            {searchResults.length > 0
                                                ? `✓ Found ${searchResults.length} matching candidate${searchResults.length !== 1 ? 's' : ''}`
                                                : 'No candidates match your criteria'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Filters Card */}
                    <div className="bg-gradient-to-br from-white to-yellow-50 border border-yellow-100 rounded-2xl shadow-xl hover:shadow-2xl hover:border-yellow-300 transition duration-300 p-8 mb-6">
                        <div className="flex items-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-2xl">⚙️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Filter Candidates</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Experience Level Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    📊 Experience Level
                                </label>
                                <select
                                    value={experienceLevel}
                                    onChange={(e) => setExperienceLevel(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition hover:border-yellow-300 shadow-sm"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="junior">Junior (0-2 years)</option>
                                    <option value="mid-level">Mid-Level (2-5 years)</option>
                                    <option value="senior">Senior (5+ years)</option>
                                </select>
                            </div>

                            {/* Match Score Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">
                                    🎯 Minimum Match Score
                                </label>
                                <select
                                    value={matchScore}
                                    onChange={(e) => setMatchScore(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition hover:border-yellow-300 shadow-sm"
                                >
                                    <option value="all">Any Score</option>
                                    <option value="70">70% and above</option>
                                    <option value="80">80% and above</option>
                                    <option value="90">90% and above</option>
                                </select>
                            </div>

                            {/* Info */}
                            <div className="flex items-end">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 w-full text-center">
                                    <p className="text-xs text-blue-700 font-bold">💡 Filters apply to search results automatically</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Results Section */}
                    <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl shadow-xl hover:shadow-2xl hover:border-purple-300 transition duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Matched Candidates
                                    </h3>
                                    {searchResults.length > 0 && (
                                        <p className="text-sm text-purple-600 font-semibold mt-1">
                                            {shortlistIds.size} shortlisted
                                        </p>
                                    )}
                                </div>
                            </div>
                            {searchResults.length > 0 && (
                                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full px-6 py-3 text-center">
                                    <p className="text-sm font-bold text-purple-700">{searchResults.length} Results</p>
                                </div>
                            )}
                        </div>

                        {/* Results Display */}
                        {uploadedCandidates.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4 opacity-30">📄</div>
                                <p className="text-gray-500 text-lg font-semibold">No candidates available</p>
                                <p className="text-gray-400 text-sm mt-2">Upload resumes on the left to populate the candidate pool for searching</p>
                            </div>
                        ) : !hasSearched ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4 opacity-30">🔍</div>
                                <p className="text-gray-500 text-lg font-semibold">No searches yet</p>
                                <p className="text-gray-400 text-sm mt-2">Search for candidates using the tools above to get started ({uploadedCandidates.length} candidates available)</p>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4 opacity-30">📭</div>
                                <p className="text-gray-500 text-lg font-semibold">No matches found</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters and search criteria</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {searchResults.map((candidate) => {
                                    const isShortlisted = shortlistIds.has(candidate.id);
                                    const matchPercentage = candidate.match;
                                    let matchColor = 'from-red-500 to-red-600';
                                    if (matchPercentage >= 90) matchColor = 'from-green-500 to-emerald-600';
                                    else if (matchPercentage >= 80) matchColor = 'from-blue-500 to-blue-600';
                                    else if (matchPercentage >= 70) matchColor = 'from-yellow-500 to-yellow-600';

                                    return (
                                        <div
                                            key={candidate.id}
                                            className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-lg transition duration-300 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                {/* Candidate Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                            {candidate.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition">{candidate.name}</h4>
                                                            <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                                                                <span className="flex items-center gap-2">
                                                                    <span>💼</span> {candidate.experience}
                                                                </span>
                                                                <span className="flex items-center gap-2">
                                                                    <span>🎯</span> {candidate.skill}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Match Score and Actions */}
                                                <div className="flex items-center gap-5 ml-4">
                                                    {/* Match Score Badge */}
                                                    <div className={`bg-gradient-to-br ${matchColor} rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition`}>
                                                        {matchPercentage}%
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2">
                                                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 text-sm flex items-center gap-2">
                                                            <span>👁️</span> View
                                                        </button>
                                                        <button
                                                            onClick={() => toggleShortlist(candidate.id)}
                                                            className={`font-semibold py-2 px-4 rounded-lg transition transform hover:scale-105 text-sm flex items-center gap-2 ${isShortlisted
                                                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                }`}
                                                        >
                                                            <span>{isShortlisted ? '⭐' : '☆'}</span> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
