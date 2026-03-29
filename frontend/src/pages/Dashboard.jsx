/**
 * Dashboard Page Component
 * Professional SaaS Recruiter Dashboard — Resume Matcher
 *
 * All business logic, state management, and API calls are preserved unchanged.
 * Only UI/layout has been refactored for a professional SaaS aesthetic.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BriefcaseIcon,
    FileTextIcon,
    TargetIcon,
    StarIcon,
    TrendingUpIcon,
    UploadCloudIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    UsersIcon,
    SparklesIcon,
    LogOutIcon,
    UserIcon,
    XIcon,
    FileIcon,
    EyeIcon,
    ZapIcon,
    BookmarkIcon,
    BookmarkCheckIcon,
    AlertCircleIcon,
    InfoIcon,
    LoaderIcon,
    ChevronRightIcon,
    BarChart2Icon,
    CheckCircleIcon,
    ShieldIcon,
    AwardIcon,
    GraduationCapIcon,
    WrenchIcon,
    ClipboardListIcon,
    MessageSquareIcon,
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();

    // ── State (unchanged) ──────────────────────────────────────────────────────
    const [stats] = useState({
        resumesProcessed: 1240,
        jobMatches: 89,
        activeShortlists: 12,
        successRate: '94%',
    });

    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [searchSkill, setSearchSkill] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('all');
    const [matchScore, setMatchScore] = useState('all');
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [shortlistIds, setShortlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [jobDescription, setJobDescription] = useState('');
    const [aiResults, setAiResults] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [hasAiSearched, setHasAiSearched] = useState(false);
    const [currentUploadedResumes, setCurrentUploadedResumes] = useState([]);

    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [selectedResumeName, setSelectedResumeName] = useState('');
    const [insightsData, setInsightsData] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState('');

    const [insightsCache, setInsightsCache] = useState({});
    const [loadingResumeIds, setLoadingResumeIds] = useState(new Set());

    // Shortlisted candidates state
    const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
    const [shortlistedLoading, setShortlistedLoading] = useState(false);
    const [shortlistedError, setShortlistedError] = useState('');
    const [hasLoadedShortlisted, setHasLoadedShortlisted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Notes modal state
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesResumeId, setNotesResumeId] = useState(null);
    const [notesResumeName, setNotesResumeName] = useState('');
    const [notesContent, setNotesContent] = useState('');
    const [notesSaving, setNotesSaving] = useState(false);
    const [notesError, setNotesError] = useState('');

    // Candidate comparison state
    const [selectedCandidates, setSelectedCandidates] = useState(new Set());
    const [showComparisonModal, setShowComparisonModal] = useState(false);
    const [comparisonData, setComparisonData] = useState([]);
    const [comparisonLoading, setComparisonLoading] = useState(false);
    const [comparisonError, setComparisonError] = useState('');

    // Active sidebar section + section refs for smooth scroll
    const [activeSection, setActiveSection] = useState('ai-match');
    const sectionRefs = {
        'ai-match': useRef(null),
        'upload': useRef(null),
        'search': useRef(null),
        'filters': useRef(null),
        'results': useRef(null),
        'shortlisted': useRef(null),
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const ref = sectionRefs[id];
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Load shortlisted candidates on component mount
    useEffect(() => {
        fetchShortlistedCandidates();
    }, []);

    // ── Handlers (unchanged) ───────────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newFiles = [...uploadedFiles];
            files.forEach(file => {
                if (newFiles.length < 10 && !newFiles.some(f => f.name === file.name)) {
                    newFiles.push(file);
                }
            });
            setUploadedFiles(newFiles);
            if (files.length === 1) {
                alert(`File "${files[0].name}" added successfully!`);
            } else {
                alert(`${files.length} files added successfully!`);
            }
        }
    };

    const handleRemoveFile = (index) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
    };

    const handleUploadAll = async () => {
        if (uploadedFiles.length === 0) {
            alert('Please select at least one resume to upload');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            const fileNames = [];
            uploadedFiles.forEach(file => {
                formData.append('resumes', file);
                fileNames.push(file.name);
            });
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');
            const response = await axios.post(`${apiBaseUrl}/resume/upload-multiple`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            const uploadedResumeNames = response.data.uploadedResumes?.map(r => r.originalName || r.fileName) || fileNames;
            setCurrentUploadedResumes(uploadedResumeNames);
            console.log('[Frontend] Uploaded resumes tracked for AI matching:', uploadedResumeNames);
            setInsightsCache({});
            console.log('[Frontend] Insights cache cleared due to new resume uploads');
            alert(`${uploadedFiles.length} resume(s) uploaded successfully!`);
            setUploadedFiles([]);
            setLoading(false);
        } catch (err) {
            setError('Error uploading resumes. Please try again.');
            setLoading(false);
            console.error('Upload error:', err);
        }
    };

    const handleSearch = async () => {
        if (!searchSkill.trim()) {
            alert('Please enter a skill to search');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiBaseUrl}/resume/search?skill=${encodeURIComponent(searchSkill)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            let results = response.data.results || [];
            if (experienceLevel !== 'all') {
                results = results.filter(r =>
                    (r.experience && r.experience.toLowerCase().includes(experienceLevel.toLowerCase()))
                );
            }
            if (matchScore !== 'all') {
                const minScore = parseInt(matchScore);
                results = results.filter(r => (r.matchScore || 0) >= minScore);
            }
            setSearchResults(results);
            setHasSearched(true);
            setLoading(false);
        } catch (err) {
            setError('Error searching resumes. Please try again.');
            setSearchResults([]);
            setHasSearched(true);
            setLoading(false);
            console.error('Search error:', err);
        }
    };

    const handleClearSearch = () => {
        setSearchSkill('');
        setExperienceLevel('all');
        setMatchScore('all');
        setSearchResults([]);
        setHasSearched(false);
    };

    const toggleShortlist = async (candidateId, candidateName) => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');

            // Call backend API to toggle shortlist
            const response = await axios.patch(
                `${apiBaseUrl}/resume/shortlist/${candidateId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update shortlist status
            const newShortlist = new Set(shortlistIds);
            if (response.data.shortlisted) {
                newShortlist.add(candidateId);
                setSuccessMessage(`${candidateName} shortlisted successfully`);
            } else {
                newShortlist.delete(candidateId);
                setSuccessMessage(`${candidateName} removed from shortlist`);
            }
            setShortlistIds(newShortlist);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);

            // Refresh shortlisted candidates list
            await fetchShortlistedCandidates();
        } catch (err) {
            console.error('Error toggling shortlist:', err);
            setSuccessMessage(`Error: ${err.response?.data?.message || 'Failed to update shortlist'}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const fetchShortlistedCandidates = async () => {
        try {
            setShortlistedLoading(true);
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${apiBaseUrl}/resume/shortlisted`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const candidates = response.data.results || [];
            setShortlistedCandidates(candidates);
            setHasLoadedShortlisted(true);
            setShortlistedError('');
        } catch (err) {
            console.error('Error fetching shortlisted candidates:', err);
            setShortlistedError(err.response?.data?.message || 'Failed to fetch shortlisted candidates');
            setHasLoadedShortlisted(true);
        } finally {
            setShortlistedLoading(false);
        }
    };

    const handleOpenNotesModal = async (resumeId, resumeName) => {
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');

            const response = await axios.get(
                `${apiBaseUrl}/resume/note/${resumeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setNotesResumeId(resumeId);
            setNotesResumeName(resumeName);
            setNotesContent(response.data.notes || '');
            setShowNotesModal(true);
            setNotesError('');
        } catch (err) {
            console.error('Error fetching notes:', err);
            setNotesError(err.response?.data?.message || 'Failed to fetch notes');
        }
    };

    const handleSaveNote = async () => {
        try {
            setNotesSaving(true);
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');

            await axios.post(
                `${apiBaseUrl}/resume/add-note/${notesResumeId}`,
                { note: notesContent },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccessMessage(`Note saved for ${notesResumeName}`);
            setTimeout(() => setSuccessMessage(''), 3000);
            setShowNotesModal(false);
            setNotesContent('');
            setNotesResumeId(null);
            setNotesResumeName('');
        } catch (err) {
            console.error('Error saving note:', err);
            setNotesError(err.response?.data?.message || 'Failed to save note');
        } finally {
            setNotesSaving(false);
        }
    };

    const handleCloseNotesModal = () => {
        setShowNotesModal(false);
        setNotesContent('');
        setNotesResumeId(null);
        setNotesResumeName('');
        setNotesError('');
    };

    const handleViewResume = async (resumeId, fileName) => {
        console.log('View resume clicked:', { resumeId, fileName });
        try {
            if (!fileName) {
                alert('Resume file name not available. Please contact support.');
                return;
            }
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const serverUrl = apiBaseUrl.replace('/api', '');
            const fileUrl = `${serverUrl}/uploads/${fileName}`;
            console.log('Opening resume URL:', fileUrl);
            window.open(fileUrl, '_blank');
        } catch (err) {
            console.error('Error viewing resume:', err);
            alert('Error opening resume. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleViewInsights = async (resumeId, resumeName) => {
        if (loadingResumeIds.has(resumeId)) {
            console.log(`[Insights] Request already in progress for ${resumeName}, ignoring duplicate request`);
            return;
        }
        if (insightsCache[resumeId]) {
            console.log(`[Insights] ✓ Loading from cache for resume: ${resumeName}`);
            setSelectedResumeId(resumeId);
            setSelectedResumeName(resumeName);
            setShowInsightsModal(true);
            setInsightsData(insightsCache[resumeId]);
            setInsightsLoading(false);
            setInsightsError('');
            return;
        }
        setSelectedResumeId(resumeId);
        setSelectedResumeName(resumeName);
        setShowInsightsModal(true);
        setInsightsLoading(true);
        setInsightsError('');
        setInsightsData(null);
        try {
            setLoadingResumeIds(prev => new Set([...prev, resumeId]));
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');
            console.log(`[Insights] Fetching from API for resume: ${resumeName} (ID: ${resumeId})`);
            const response = await axios.get(
                `${apiBaseUrl}/ai/resume-insights/${resumeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if (response.data.cached) {
                console.log(`[Insights] Loaded from DATABASE CACHE for resume: ${resumeName} (Generated: ${response.data.cachedAt})`);
            } else {
                console.log(`[Insights] Freshly generated from OpenAI for resume: ${resumeName}`);
            }
            console.log('[Insights] Data received from API:', response.data);
            setInsightsCache(prev => ({
                ...prev,
                [resumeId]: response.data
            }));
            setInsightsData(response.data);
            setInsightsLoading(false);
        } catch (err) {
            console.error('[Insights] Error fetching insights:', err);
            if (err.response?.status === 429) {
                const errorMessage = 'Too many insight requests. Please wait before requesting more insights.';
                console.warn('[Insights] Rate limit exceeded (429)');
                setInsightsError(errorMessage);
            } else {
                const errorMessage = err.response?.data?.error || err.response?.data?.details || err.response?.data?.message || 'Failed to fetch resume insights. Please try again.';
                setInsightsError(errorMessage);
            }
            setInsightsLoading(false);
        } finally {
            setLoadingResumeIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(resumeId);
                return newSet;
            });
        }
    };

    const handleCloseInsightsModal = () => {
        setShowInsightsModal(false);
        setInsightsData(null);
        setInsightsError('');
        setSelectedResumeId(null);
        setSelectedResumeName('');
    };

    const handleAiAnalysis = async () => {
        if (!jobDescription.trim()) {
            setAiError('Please enter a job description');
            return;
        }
        if (currentUploadedResumes.length === 0) {
            setAiError('Please upload resumes first before analyzing');
            return;
        }
        setAiLoading(true);
        setAiError('');
        setAiResults([]);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${apiBaseUrl}/ai/ai-match`,
                {
                    jobDescription: jobDescription.trim(),
                    filterByNames: currentUploadedResumes
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const resultsMap = new Map();
            const rawResults = response.data.data || response.data || [];
            for (const result of rawResults) {
                const key = result.resumeId || result.resume;
                if (!resultsMap.has(key)) {
                    resultsMap.set(key, result);
                }
            }
            const sortedResults = Array.from(resultsMap.values())
                .sort((a, b) => b.score - a.score);
            console.log(`[Frontend] Received ${rawResults.length} results, deduplicated to ${sortedResults.length} unique candidates`);
            setAiResults(sortedResults);
            setHasAiSearched(true);
            setAiLoading(false);
        } catch (err) {
            console.error('AI analysis error:', err);
            if (err.response?.status === 429) {
                const errorMessage = 'Too many AI matching requests. Please wait before analyzing more job descriptions.';
                console.warn('Rate limit exceeded (429) on AI matching');
                setAiError(errorMessage);
            } else {
                setAiError(err.response?.data?.message || 'Error analyzing candidates. Please try again.');
            }
            setHasAiSearched(true);
            setAiLoading(false);
        }
    };

    const handleClearAiSearch = () => {
        setJobDescription('');
        setAiResults([]);
        setHasAiSearched(false);
        setAiError('');
    };

    const toggleCandidateSelection = (candidateId) => {
        const newSelected = new Set(selectedCandidates);
        if (newSelected.has(candidateId)) {
            newSelected.delete(candidateId);
        } else {
            newSelected.add(candidateId);
        }
        setSelectedCandidates(newSelected);
    };

    const handleCompare = async () => {
        if (selectedCandidates.size === 0) {
            alert('Please select at least 1 candidate to compare');
            return;
        }

        try {
            setComparisonLoading(true);
            setComparisonError('');
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${apiBaseUrl}/resume/compare`,
                { resumeIds: Array.from(selectedCandidates) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setComparisonData(response.data.data || []);
            setShowComparisonModal(true);
            setComparisonLoading(false);
        } catch (err) {
            console.error('Error comparing resumes:', err);
            setComparisonError(err.response?.data?.message || 'Failed to compare candidates');
            setComparisonLoading(false);
        }
    };

    const handleCloseComparison = () => {
        setShowComparisonModal(false);
        setComparisonData([]);
        setComparisonError('');
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    const getScoreMeta = (score) => {
        if (score >= 90) return { label: 'Excellent', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', barClass: 'bg-emerald-500', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        if (score >= 80) return { label: 'Strong', colorClass: 'text-blue-600', bgClass: 'bg-blue-50', barClass: 'bg-blue-500', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' };
        if (score >= 70) return { label: 'Good', colorClass: 'text-amber-600', bgClass: 'bg-amber-50', barClass: 'bg-amber-500', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' };
        if (score >= 60) return { label: 'Fair', colorClass: 'text-orange-600', bgClass: 'bg-orange-50', barClass: 'bg-orange-500', badgeClass: 'bg-orange-100 text-orange-700 border-orange-200' };
        return { label: 'Low', colorClass: 'text-red-600', bgClass: 'bg-red-50', barClass: 'bg-red-500', badgeClass: 'bg-red-100 text-red-700 border-red-200' };
    };

    const getInitial = (str) => (str || 'R').charAt(0).toUpperCase();

    // Sidebar nav items
    const navItems = [
        { id: 'ai-match', label: 'AI Matching', icon: SparklesIcon },
        { id: 'upload', label: 'Upload Resumes', icon: UploadCloudIcon },
        { id: 'search', label: 'Search Candidates', icon: SearchIcon },
        { id: 'filters', label: 'Filters', icon: SlidersHorizontalIcon },
        { id: 'results', label: 'Candidates', icon: UsersIcon },
        { id: 'shortlisted', label: 'Shortlisted', icon: BookmarkCheckIcon },
    ];

    // Scroll offset to account for sticky header (64px)
    const SCROLL_OFFSET = 80;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">

            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <aside className="w-60 flex-shrink-0 bg-slate-900 flex flex-col fixed inset-y-0 left-0 z-30">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">RecruitAI</p>
                        <p className="text-slate-500 text-xs">Dashboard</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    <p className="section-label px-3 pt-2 pb-1">Tools</p>
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => scrollToSection(id)}
                            className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            {activeSection === id && (
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="px-3 py-4 border-t border-slate-800">
                    <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                        <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">Recruiter</p>
                            <p className="text-slate-500 text-xs truncate">Welcome back</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="sidebar-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                        <LogOutIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="flex-1 ml-60 flex flex-col min-h-screen">

                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Recruiter Dashboard</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Upload resumes, search candidates, and shortlist applicants</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {shortlistIds.size > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
                                <BookmarkCheckIcon className="w-3.5 h-3.5" />
                                {shortlistIds.size} shortlisted
                            </span>
                        )}
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </header>

                {/* Success Message Banner */}
                {successMessage && (
                    <div className={`mx-8 mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium ${successMessage.includes('Error')
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        }`}>
                        {successMessage.includes('Error') ? (
                            <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{successMessage}</span>
                    </div>
                )}

                <main className="flex-1 px-8 py-8 space-y-8">

                    {/* ── Stats Row ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Resumes Processed', value: stats.resumesProcessed.toLocaleString(), badge: 'Total', icon: FileTextIcon, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
                            { label: 'Job Matches', value: stats.jobMatches, badge: 'Active', icon: TargetIcon, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                            { label: 'Active Shortlists', value: stats.activeShortlists, badge: 'Active', icon: StarIcon, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                            { label: 'Match Success Rate', value: stats.successRate, badge: 'Rate', icon: TrendingUpIcon, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
                        ].map(({ label, value, badge, icon: Icon, iconBg, iconColor }) => (
                            <div key={label} className="saas-card p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 cursor-default">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`stat-icon-wrapper ${iconBg}`}>
                                        <Icon className={`w-5 h-5 ${iconColor}`} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{badge}</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── AI Candidate Matching ──────────────────────────────── */}
                    <section id="ai-match" ref={sectionRefs['ai-match']}>
                        <div className="flex items-center gap-2 mb-4">
                            <SparklesIcon className="w-4 h-4 text-indigo-500" />
                            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">AI Candidate Matching</h2>
                        </div>

                        <div className="saas-card-hover p-6 mb-4">
                            <div className="flex items-start gap-4 mb-5">
                                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ZapIcon className="w-4.5 h-4.5 text-indigo-600 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Match Candidates Instantly</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">Paste a job description and let AI rank the best-fit candidates</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Job Description
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here — e.g., We are looking for a React developer with 5+ years of experience..."
                                        rows={6}
                                        className="saas-textarea"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAiAnalysis}
                                        disabled={aiLoading || !jobDescription.trim()}
                                        className="btn-primary flex-1"
                                    >
                                        {aiLoading ? (
                                            <>
                                                <LoaderIcon className="w-4 h-4 animate-spin-slow" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-4 h-4" />
                                                Analyze Candidates
                                            </>
                                        )}
                                    </button>
                                    {hasAiSearched && (
                                        <button onClick={handleClearAiSearch} className="btn-secondary">
                                            <XIcon className="w-4 h-4" />
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {aiError && (
                                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{aiError}</span>
                                    </div>
                                )}

                                {hasAiSearched && !aiLoading && (
                                    <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${aiResults.length > 0
                                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                        : 'bg-amber-50 border border-amber-200 text-amber-700'
                                        }`}>
                                        {aiResults.length > 0 ? (
                                            <><CheckCircleIcon className="w-4 h-4" /> Found {aiResults.length} matching candidate{aiResults.length !== 1 ? 's' : ''}</>
                                        ) : (
                                            <><InfoIcon className="w-4 h-4" /> No candidates match your criteria</>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Results */}
                        {hasAiSearched && (
                            <div className="saas-card-hover p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <UsersIcon className="w-4 h-4 text-slate-500" />
                                        <h3 className="text-sm font-semibold text-slate-900">Match Results</h3>
                                        {aiResults.length > 0 && (
                                            <span className="text-xs text-slate-500">· ranked by score</span>
                                        )}
                                    </div>
                                    {aiResults.length > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {aiResults.length} results
                                        </span>
                                    )}
                                </div>

                                {aiLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                        <LoaderIcon className="w-8 h-8 mb-3 animate-spin-slow" />
                                        <p className="text-sm font-medium">Analyzing candidates with AI...</p>
                                    </div>
                                ) : aiResults.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                        <SearchIcon className="w-10 h-10 mb-3 opacity-30" />
                                        <p className="text-sm font-medium text-slate-500">No matches found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting the job description or upload more resumes</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {aiResults.map((result, index) => {
                                            const score = result.score || 0;
                                            const meta = getScoreMeta(score);
                                            return (
                                                <div
                                                    key={index}
                                                    className="ai-result-row group"
                                                >
                                                    {/* Rank */}
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                                                        {index + 1}
                                                    </div>

                                                    {/* Name & label */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-700 transition">
                                                            {result.resume || 'Resume'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="progress-bar-track w-32">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${meta.barClass}`}
                                                                    style={{ width: `${score}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-medium ${meta.colorClass}`}>{score}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Badge */}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass}`}>
                                                        {meta.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* ── Recruitment Tools ──────────────────────────────────── */}
                    <section id="tools">
                        <div className="flex items-center gap-2 mb-4">
                            <WrenchIcon className="w-4 h-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Recruitment Tools</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

                            {/* Upload Resumes */}
                            <div id="upload" ref={sectionRefs['upload']} className="saas-card-hover p-6">
                                <div className="flex items-start gap-3 mb-5">
                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <UploadCloudIcon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Upload Resumes</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{uploadedFiles.length} file(s) selected</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Dropzone */}
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition duration-200 cursor-pointer group">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileUpload}
                                            multiple
                                            className="hidden"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer block">
                                            <UploadCloudIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 mx-auto mb-2 transition" />
                                            <p className="text-sm font-medium text-slate-600">Drop resumes here or <span className="text-indigo-600 font-semibold">browse</span></p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX · Max 10 files · 10 MB each</p>
                                        </label>
                                    </div>

                                    {/* File list */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-44 overflow-y-auto space-y-1.5">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-3 py-2">
                                                    <FileIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                                                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <button
                                        onClick={handleUploadAll}
                                        disabled={uploadedFiles.length === 0 || loading}
                                        className="btn-primary w-full"
                                    >
                                        {loading ? (
                                            <><LoaderIcon className="w-4 h-4 animate-spin-slow" /> Uploading...</>
                                        ) : (
                                            <><UploadCloudIcon className="w-4 h-4" /> Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}</>
                                        )}
                                    </button>

                                    {uploadedFiles.length > 0 && !loading && (
                                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                            <p className="text-xs text-emerald-700 font-medium">
                                                Ready to upload {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Search Candidates */}
                            <div id="search" ref={sectionRefs['search']} className="saas-card-hover p-6">
                                <div className="flex items-start gap-3 mb-5">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <SearchIcon className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">Search Candidates</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Find resumes by skill keyword</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1.5">Skill keyword</label>
                                        <div className="relative">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={searchSkill}
                                                onChange={(e) => setSearchSkill(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                placeholder="e.g. React, Python, Node.js"
                                                className="saas-input pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSearch}
                                            className="btn-primary flex-1"
                                        >
                                            <SearchIcon className="w-4 h-4" />
                                            Search
                                        </button>
                                        {hasSearched && (
                                            <button onClick={handleClearSearch} className="btn-secondary">
                                                <XIcon className="w-4 h-4" />
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {hasSearched && (
                                        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${searchResults.length > 0
                                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                            : 'bg-amber-50 border border-amber-200 text-amber-700'
                                            }`}>
                                            {searchResults.length > 0 ? (
                                                <><CheckCircleIcon className="w-3.5 h-3.5" /> Found {searchResults.length} matching candidate{searchResults.length !== 1 ? 's' : ''}</>
                                            ) : (
                                                <><InfoIcon className="w-3.5 h-3.5" /> No candidates match your criteria</>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div id="filters" ref={sectionRefs['filters']} className="saas-card-hover p-6 mb-5">
                            <div className="flex items-center gap-2 mb-5">
                                <SlidersHorizontalIcon className="w-4 h-4 text-slate-500" />
                                <h3 className="text-sm font-semibold text-slate-900">Filter Candidates</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Experience Level</label>
                                    <select
                                        value={experienceLevel}
                                        onChange={(e) => setExperienceLevel(e.target.value)}
                                        className="saas-select"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="junior">Junior (0–2 years)</option>
                                        <option value="mid-level">Mid-Level (2–5 years)</option>
                                        <option value="senior">Senior (5+ years)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Minimum Match Score</label>
                                    <select
                                        value={matchScore}
                                        onChange={(e) => setMatchScore(e.target.value)}
                                        className="saas-select"
                                    >
                                        <option value="all">Any Score</option>
                                        <option value="70">70% and above</option>
                                        <option value="80">80% and above</option>
                                        <option value="90">90% and above</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 w-full">
                                        <InfoIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                        <span>Filters apply automatically to search results</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results */}
                        <div id="results" ref={sectionRefs['results']} className="saas-card-hover p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 text-slate-500" />
                                    <h3 className="text-sm font-semibold text-slate-900">Matched Candidates</h3>
                                    {searchResults.length > 0 && (
                                        <span className="text-xs text-slate-400">· {shortlistIds.size} shortlisted</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedCandidates.size > 0 && (
                                        <button
                                            onClick={handleCompare}
                                            disabled={comparisonLoading}
                                            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <BarChart2Icon className="w-3.5 h-3.5" />
                                            Compare ({selectedCandidates.size})
                                        </button>
                                    )}
                                    {searchResults.length > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                            {searchResults.length} results
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!hasSearched ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <SearchIcon className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No searches yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Enter a skill and search to find matching candidates</p>
                                </div>
                            ) : loading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <LoaderIcon className="w-8 h-8 mb-3 animate-spin-slow" />
                                    <p className="text-sm font-medium">Searching...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <FileTextIcon className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No matches found</p>
                                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or upload more resumes</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {searchResults.map((candidate) => {
                                        const isShortlisted = shortlistIds.has(candidate._id);
                                        const matchPercentage = candidate.matchScore || Math.floor(Math.random() * 30 + 70);
                                        const meta = getScoreMeta(matchPercentage);

                                        return (
                                            <div
                                                key={candidate._id}
                                                className="candidate-row group"
                                            >
                                                {/* Top row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCandidates.has(candidate._id)}
                                                            onChange={() => toggleCandidateSelection(candidate._id)}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                                                        />
                                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {getInitial(candidate.name)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition">
                                                                {candidate.name || 'Unknown Candidate'}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <FileTextIcon className="w-3 h-3 text-slate-400" />
                                                                <p className="text-xs text-slate-500">{candidate.fileName || 'Resume'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Score badge */}
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${meta.badgeClass}`}>
                                                        {matchPercentage}% · {meta.label}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="progress-bar-track mb-3">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${meta.barClass}`}
                                                        style={{ width: `${matchPercentage}%` }}
                                                    />
                                                </div>

                                                {/* Skills */}
                                                <div className="mb-3">
                                                    {candidate.skills && candidate.skills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {candidate.skills.map((skill, index) => (
                                                                <span key={index} className="skill-tag">{skill}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No skills extracted</p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleViewResume(candidate._id, candidate.fileName || '')}
                                                        className="btn-secondary text-xs py-1.5 px-3"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewInsights(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className="btn-secondary text-xs py-1.5 px-3 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        <SparklesIcon className="w-3.5 h-3.5" />
                                                        Insights
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenNotesModal(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className="btn-secondary text-xs py-1.5 px-3 text-slate-600 border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <MessageSquareIcon className="w-3.5 h-3.5" />
                                                        Notes
                                                    </button>
                                                    <button
                                                        onClick={() => toggleShortlist(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className={`text-xs py-1.5 px-3 rounded-lg border font-semibold transition duration-150 inline-flex items-center gap-1.5 ${isShortlisted
                                                            ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {isShortlisted ? (
                                                            <><BookmarkCheckIcon className="w-3.5 h-3.5" /> Shortlisted</>
                                                        ) : (
                                                            <><BookmarkIcon className="w-3.5 h-3.5" /> Shortlist</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Shortlisted Candidates */}
                        <div id="shortlisted" ref={sectionRefs['shortlisted']} className="saas-card-hover p-6 mt-5">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <BookmarkCheckIcon className="w-4 h-4 text-amber-500" />
                                    <h3 className="text-sm font-semibold text-slate-900">Shortlisted Candidates</h3>
                                </div>
                                {shortlistedCandidates.length > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        {shortlistedCandidates.length} candidate{shortlistedCandidates.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {shortlistedLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <LoaderIcon className="w-8 h-8 mb-3 animate-spin-slow" />
                                    <p className="text-sm font-medium">Loading shortlisted candidates...</p>
                                </div>
                            ) : shortlistedError ? (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{shortlistedError}</span>
                                </div>
                            ) : shortlistedCandidates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <BookmarkIcon className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No shortlisted candidates yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Click the shortlist button on candidates to add them here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {shortlistedCandidates.map((candidate) => {
                                        const matchPercentage = candidate.matchScore || 0;
                                        const meta = getScoreMeta(matchPercentage);

                                        return (
                                            <div
                                                key={candidate._id}
                                                className="candidate-row group"
                                            >
                                                {/* Top row */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCandidates.has(candidate._id)}
                                                            onChange={() => toggleCandidateSelection(candidate._id)}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                                                        />
                                                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                            {getInitial(candidate.name)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition">
                                                                {candidate.name || 'Unknown Candidate'}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <FileTextIcon className="w-3 h-3 text-slate-400" />
                                                                <p className="text-xs text-slate-500">{candidate.fileName || 'Resume'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Shortlisted badge */}
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200">
                                                        <BookmarkCheckIcon className="w-3 h-3 mr-1" />
                                                        Shortlisted
                                                    </span>
                                                </div>

                                                {/* Skills */}
                                                <div className="mb-3">
                                                    {candidate.skills && candidate.skills.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {candidate.skills.map((skill, index) => (
                                                                <span key={index} className="skill-tag">{skill}</span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-400 italic">No skills extracted</p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={() => handleViewResume(candidate._id, candidate.fileName || '')}
                                                        className="btn-secondary text-xs py-1.5 px-3"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewInsights(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className="btn-secondary text-xs py-1.5 px-3 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                                    >
                                                        <SparklesIcon className="w-3.5 h-3.5" />
                                                        Insights
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenNotesModal(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className="btn-secondary text-xs py-1.5 px-3 text-slate-600 border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <MessageSquareIcon className="w-3.5 h-3.5" />
                                                        Notes
                                                    </button>
                                                    <button
                                                        onClick={() => toggleShortlist(candidate._id, candidate.name || candidate.fileName || 'Resume')}
                                                        className="text-xs py-1.5 px-3 rounded-lg border font-semibold transition duration-150 inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                                    >
                                                        <BookmarkCheckIcon className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                </main>
            </div>

            {/* ── Insights Modal ──────────────────────────────────────────────── */}
            {showInsightsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <SparklesIcon className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Resume Insights</h2>
                                    <p className="text-xs text-slate-500 truncate max-w-xs">{selectedResumeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseInsightsModal}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            {insightsLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <LoaderIcon className="w-8 h-8 mb-3 animate-spin-slow" />
                                    <p className="text-sm font-medium">Analyzing resume with AI...</p>
                                </div>
                            ) : insightsError ? (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold">Error</p>
                                        <p>{insightsError}</p>
                                    </div>
                                </div>
                            ) : insightsData ? (
                                <div className="space-y-5">

                                    {/* Top Skills */}
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AwardIcon className="w-4 h-4 text-amber-600" />
                                            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Top Skills</h3>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{insightsData.topSkills || 'N/A'}</p>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TargetIcon className="w-4 h-4 text-indigo-500" />
                                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Skills</h3>
                                        </div>
                                        {insightsData.skills && insightsData.skills.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {insightsData.skills.map((skill, idx) => (
                                                    <span key={idx} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500">No skills identified</p>
                                        )}
                                    </div>

                                    {/* Strengths */}
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldIcon className="w-4 h-4 text-emerald-600" />
                                            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Strengths</h3>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{insightsData.strengths || 'No strengths identified'}</p>
                                    </div>

                                    {/* Missing Skills */}
                                    {insightsData.missingSkills && insightsData.missingSkills.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ClipboardListIcon className="w-4 h-4 text-orange-500" />
                                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Skills to Develop</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {insightsData.missingSkills.map((skill, idx) => (
                                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Experience Level */}
                                    {insightsData.experience && (
                                        <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart2Icon className="w-4 h-4 text-violet-600" />
                                                <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wide">Experience Level</h3>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700">{insightsData.experience}</p>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <GraduationCapIcon className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Recommendation</h3>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{insightsData.recommendation || 'No recommendation available'}</p>
                                    </div>

                                </div>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end px-6 py-4 border-t border-slate-100 flex-shrink-0">
                            <button
                                onClick={handleCloseInsightsModal}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Notes Modal ──────────────────────────────────────────────────── */}
            {showNotesModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <MessageSquareIcon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Add Notes</h2>
                                    <p className="text-xs text-slate-500 truncate max-w-xs">{notesResumeName}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseNotesModal}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 flex-1 flex flex-col">
                            {notesError && (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{notesError}</span>
                                </div>
                            )}

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={notesContent}
                                onChange={(e) => setNotesContent(e.target.value)}
                                placeholder="Add your recruiter notes here... (e.g., Interview feedback, follow-up reminders, strengths to highlight, etc.)"
                                rows={6}
                                className="saas-textarea flex-1 mb-4"
                            />
                            <p className="text-xs text-slate-500">
                                {notesContent.length} characters · Notes are saved privately to your account
                            </p>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                            <button
                                onClick={handleCloseNotesModal}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNote}
                                disabled={notesSaving}
                                className="btn-primary"
                            >
                                {notesSaving ? (
                                    <>
                                        <LoaderIcon className="w-4 h-4 animate-spin-slow" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Save Note
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {showComparisonModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <BarChart2Icon className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Compare Candidates</h2>
                                    <p className="text-xs text-slate-500">{comparisonData.length} candidates selected</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseComparison}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable Comparison Table */}
                        <div className="flex-1 overflow-auto px-6 py-5">
                            {comparisonError && (
                                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    <AlertCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{comparisonError}</span>
                                </div>
                            )}

                            {comparisonLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <LoaderIcon className="w-8 h-8 mb-3 animate-spin-slow" />
                                    <p className="text-sm font-medium">Loading comparison data...</p>
                                </div>
                            ) : comparisonData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <BarChart2Icon className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No comparison data</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {/* Candidate Names Row */}
                                            <tr className="border-b border-slate-200">
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10">Candidate</td>
                                                {comparisonData.map((candidate) => (
                                                    <td key={candidate._id} className="py-3 px-4 text-center font-semibold text-slate-900 min-w-[200px]">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2">
                                                                {getInitial(candidate.name)}
                                                            </div>
                                                            <span className="truncate max-w-[180px]">{candidate.name || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* File Name Row */}
                                            <tr className="border-b border-slate-200">
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10">File Name</td>
                                                {comparisonData.map((candidate) => (
                                                    <td key={candidate._id} className="py-3 px-4 text-center text-slate-600 text-xs min-w-[200px]">
                                                        <span className="truncate block">{candidate.fileName || 'N/A'}</span>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Match Score Row */}
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10">Match Score</td>
                                                {comparisonData.map((candidate) => {
                                                    const score = candidate.matchScore || 0;
                                                    const meta = getScoreMeta(score);
                                                    return (
                                                        <td key={candidate._id} className="py-3 px-4 text-center min-w-[200px]">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${meta.badgeClass}`}>
                                                                {score}% {meta.label}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>

                                            {/* Skills Row */}
                                            <tr className="border-b border-slate-200">
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10">Skills</td>
                                                {comparisonData.map((candidate) => (
                                                    <td key={candidate._id} className="py-3 px-4 text-center min-w-[200px]">
                                                        <div className="flex flex-wrap gap-1 justify-center">
                                                            {candidate.skills && candidate.skills.length > 0 ? (
                                                                candidate.skills.slice(0, 5).map((skill, idx) => (
                                                                    <span key={idx} className="skill-tag">{skill}</span>
                                                                ))
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">No skills</span>
                                                            )}
                                                            {candidate.skills && candidate.skills.length > 5 && (
                                                                <span className="text-xs text-slate-500">+{candidate.skills.length - 5} more</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Shortlisted Status */}
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10">Status</td>
                                                {comparisonData.map((candidate) => (
                                                    <td key={candidate._id} className="py-3 px-4 text-center min-w-[200px]">
                                                        {candidate.shortlisted ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                                <BookmarkCheckIcon className="w-3 h-3" />
                                                                Shortlisted
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-500">Not Shortlisted</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* Notes Row */}
                                            <tr>
                                                <td className="py-3 px-4 font-semibold text-slate-900 bg-slate-50 sticky left-0 z-10 align-top">Notes</td>
                                                {comparisonData.map((candidate) => (
                                                    <td key={candidate._id} className="py-3 px-4 text-left text-xs text-slate-600 min-w-[200px]">
                                                        <p className="line-clamp-3">{candidate.notes || 'No notes'}</p>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                            <button
                                onClick={handleCloseComparison}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
