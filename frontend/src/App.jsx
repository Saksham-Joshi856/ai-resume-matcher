import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Configure axios to include JWT token in all requests
const getAxiosConfig = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      getAxiosConfig(savedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        email,
        password,
      });

      const newToken = response.data?.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        getAxiosConfig(newToken);
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setAuthError(
        err.response?.data?.message || `${isSignup ? "Signup" : "Login"} failed. Please try again.`
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    getAxiosConfig(null);
  };

  if (!isAuthenticated) {
    return (
      <main className="w-screen h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden fixed top-0 left-0">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Main Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-12">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center items-start text-white space-y-8">
              <div>
                <h1 className="text-6xl font-bold mb-4 leading-tight">
                  AI Resume<br />Matcher
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Intelligently rank and match resumes against job descriptions using advanced AI algorithms.
                </p>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Fast & Accurate</h3>
                    <p className="text-blue-100">Get instant resume rankings with precise skill matching</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Smart Matching</h3>
                    <p className="text-blue-100">Advanced algorithms find the best candidates for your roles</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-3xl">⭐</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Shortlist & Manage</h3>
                    <p className="text-blue-100">Organize and track your top candidates effortlessly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-opacity-95">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {isSignup ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-slate-600">
                    {isSignup ? "Start matching resumes today" : "Sign in to your account"}
                  </p>
                </div>

                {authError && (
                  <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed text-lg"
                  >
                    {authLoading ? "⏳ Loading..." : isSignup ? "📝 Create Account" : "🔓 Sign In"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-center text-slate-600 text-sm">
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <button
                      onClick={() => {
                        setIsSignup(!isSignup);
                        setAuthError("");
                      }}
                      className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                    >
                      {isSignup ? "Sign In" : "Sign Up"}
                    </button>
                  </p>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                  Protected by enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppContent onLogout={handleLogout} userEmail={email} />
  );
}

function AppContent({ onLogout, userEmail }) {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [rankedResumes, setRankedResumes] = useState([]);
  const [topCandidate, setTopCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchSkill, setSearchSkill] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchNotice, setSearchNotice] = useState("");
  const [shortlistedResumes, setShortlistedResumes] = useState([]);
  const [shortlistNotice, setShortlistNotice] = useState("");

  const selectedFileNames = useMemo(
    () => files.map((file) => file.name),
    [files]
  );

  const displayResults = useMemo(() => {
    return filteredResults.filter((r) => {
      const score = Number(r.matchScore ?? 0);
      if (filter === "top") return score >= 70;
      if (filter === "medium") return score >= 30 && score < 70;
      if (filter === "weak") return score < 30;
      if (filter === "shortlisted") return r.shortlisted === true;
      return true;
    });
  }, [filteredResults, filter]);

  const fetchShortlistedResumes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resume/shortlisted`);
      const results = Array.isArray(res.data?.results) ? res.data.results : [];
      setShortlistedResumes(results);
      setShortlistNotice(results.length ? "" : "No shortlisted resumes yet.");
    } catch (err) {
      console.error(err);
      setShortlistedResumes([]);
      setShortlistNotice("Failed to load shortlisted resumes.");
    }
  };

  useEffect(() => {
    fetchShortlistedResumes();
  }, []);

  const handleFileChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one resume file.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please add a job description before ranking.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const formData = new FormData();
    files.forEach((file) => formData.append("resumes", file));
    formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/job/upload-and-rank`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data || {};
      setRankedResumes(Array.isArray(data.rankedResumes) ? data.rankedResumes : []);
      setTopCandidate(data.topCandidate || null);
      setSuccessMessage(data.message || "Resumes ranked successfully.");
    } catch (submitError) {
      const message =
        submitError?.response?.data?.error ||
        submitError?.response?.data?.message ||
        "Failed to upload and rank resumes. Please try again.";
      setError(message);
      setRankedResumes([]);
      setTopCandidate(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async () => {
    setSearchNotice("");

    if (!searchSkill.trim()) {
      setFilteredResults([]);
      setSearchNotice("Enter one or more skills to search.");
      return;
    }

    try {
      setError("");
      const params = new URLSearchParams({
        skill: searchSkill.trim(),
        jobDescription: jobDescription || "",
      });

      const res = await axios.get(
        `${API_BASE_URL}/api/resume/search?${params.toString()}`
      );
      const results = Array.isArray(res.data?.results) ? res.data.results : [];
      setFilteredResults(results);
      setFilter("all");
      if (results.length === 0) {
        setSearchNotice("No resumes matched your search keywords.");
      }
    } catch (err) {
      console.error(err);
      setFilteredResults([]);
      setSearchNotice("Search failed. Ensure backend is running and try again.");
    }
  };

  const handleShortlist = async (id) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/resume/shortlist/${id}`
      );

      const nextShortlisted = Boolean(res.data?.shortlisted);
      let toggledResume = null;

      setFilteredResults((prev) =>
        prev.map((resume) =>
          resume._id === id
            ? ((toggledResume = { ...resume, shortlisted: nextShortlisted }), toggledResume)
            : resume
        )
      );

      setShortlistedResumes((prev) => {
        if (nextShortlisted) {
          const sourceResume = toggledResume || prev.find((r) => r._id === id);
          if (!sourceResume) {
            return prev;
          }
          const updatedResume = { ...sourceResume, shortlisted: true };
          return [updatedResume, ...prev.filter((r) => r._id !== id)];
        }

        return prev.filter((r) => r._id !== id);
      });

      setShortlistNotice((prev) => (nextShortlisted ? "" : prev));

      if (nextShortlisted && !toggledResume) {
        fetchShortlistedResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setJobDescription("");
    setRankedResumes([]);
    setTopCandidate(null);
    setError("");
    setSuccessMessage("");
    setSearchSkill("");
    setFilteredResults([]);
    setFilter("all");
    setSearchNotice("");
    setShortlistedResumes([]);
    setShortlistNotice("");
    fetchShortlistedResumes();
  };

  return (
    <main className="w-screen min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              AI Resume Matcher
            </h1>
            <p className="text-slate-600 text-lg">
              Intelligently rank resumes against job descriptions
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </header>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left - Upload Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Upload & Analyze</h2>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-800">
                  📄 Resume Files (.pdf, .docx)
                </label>
                <input
                  className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-sm text-slate-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 transition-all"
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
                {selectedFileNames.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Selected Files:</p>
                    <ul className="space-y-1">
                      {selectedFileNames.map((name) => (
                        <li key={name} className="text-sm text-slate-600 flex items-center">
                          <span className="mr-2 text-blue-600">✓</span> {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-800">
                  🎯 Job Description
                </label>
                <textarea
                  className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-32"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "⏳ Ranking..." : "🚀 Upload and Rank"}
                </button>
                <button
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-all duration-200"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right - Top Candidate */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">🏆 Top Match</h2>
              {topCandidate ? (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                  <p className="text-sm text-emerald-600 font-semibold mb-2">Best Candidate</p>
                  <p className="text-xl font-bold text-slate-900">{topCandidate.name}</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-bold text-emerald-600">{topCandidate.matchScore}</span>
                    <span className="text-emerald-600 font-semibold mb-1">% Match</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-center">
                  <p className="text-slate-600 font-medium">Upload resumes to see top match</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold flex items-center gap-2">
            <span>❌</span> {error}
          </div>
        )}
        {successMessage && !error && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-2">
            <span>✅</span> {successMessage}
          </div>
        )}

        {/* Search and Shortlist Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">🔍 Search by Skills</h2>
            <input
              type="text"
              placeholder="e.g. react, node.js, mongodb..."
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4"
            />
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🔎 Search Resumes
            </button>
            {searchNotice && (
              <p className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                {searchNotice}
              </p>
            )}
          </div>

          {/* Shortlisted Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">⭐ Shortlisted</h2>
            {shortlistedResumes.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center border border-slate-200">
                <p className="text-slate-600 font-medium">{shortlistNotice || "No resumes shortlisted yet"}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shortlistedResumes.map((r, index) => (
                  <div
                    key={r._id || `${r.name}-${index}`}
                    className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-slate-900">{r.name}</p>
                    {Array.isArray(r.skills) && r.skills.length > 0 && (
                      <p className="mt-1 text-xs text-slate-600">
                        <span className="font-semibold">Skills:</span> {r.skills.slice(0, 3).join(", ")}
                        {r.skills.length > 3 ? "..." : ""}
                      </p>
                    )}
                    <button
                      onClick={() => handleShortlist(r._id)}
                      className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-lg transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ranked Resumes - Full Width */}
        {rankedResumes.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📊 Ranked Resumes</h2>
            <div className="space-y-4">
              {rankedResumes.map((resume, index) => (
                <article
                  key={`${resume.name}-${index}`}
                  className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">{resume.name}</h3>
                    <span className={`inline-block px-4 py-2 rounded-full font-bold text-white ${resume.matchScore >= 70
                      ? "bg-green-600"
                      : resume.matchScore >= 40
                        ? "bg-yellow-600"
                        : "bg-red-600"
                      }`}>
                      {resume.matchScore}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-bold text-green-700 mb-2">✅ Matched Skills</h4>
                      <p className="text-sm text-slate-700">
                        {resume.matchedSkills?.length ? resume.matchedSkills.slice(0, 5).join(", ") : "None"}
                        {resume.matchedSkills?.length > 5 ? `+${resume.matchedSkills.length - 5}` : ""}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-bold text-red-700 mb-2">❌ Missing Skills</h4>
                      <p className="text-sm text-slate-700">
                        {resume.missingSkills?.length ? resume.missingSkills.slice(0, 5).join(", ") : "None"}
                        {resume.missingSkills?.length > 5 ? `+${resume.missingSkills.length - 5}` : ""}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-bold text-blue-700 mb-2">💡 Suggestions</h4>
                      {resume.suggestions?.length ? (
                        <ul className="text-sm text-slate-700 space-y-1">
                          {resume.suggestions.slice(0, 2).map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-700">Great match!</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Search Results - Full Width */}
        {filteredResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">🎯 Search Results</h2>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === "all"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-200 text-slate-800 hover:bg-slate-300"
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("top")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === "top"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                >
                  Top (70+)
                </button>
                <button
                  onClick={() => setFilter("medium")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === "medium"
                    ? "bg-yellow-600 text-white shadow-md"
                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setFilter("weak")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${filter === "weak"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                >
                  Low
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {displayResults.map((r, index) => {
                const score = Number(r.matchScore ?? 0);
                const scoreClass =
                  score >= 70
                    ? "bg-green-100 text-green-700"
                    : score < 30
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700";

                return (
                  <div
                    key={r._id || `${r.name}-${index}`}
                    className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all flex justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{r.name}</p>
                      {Array.isArray(r.skills) && r.skills.length > 0 && (
                        <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                          {r.skills.slice(0, 5).join(" • ")}
                          {r.skills.length > 5 ? ` +${r.skills.length - 5}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg font-bold text-sm ${scoreClass}`}>
                        {score}%
                      </span>
                      <button
                        onClick={() => handleShortlist(r._id)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all"
                      >
                        {r.shortlisted ? "★" : "☆"} {r.shortlisted ? "Listed" : "List"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {displayResults.length === 0 && (
                <p className="text-center py-8 text-slate-600 font-medium">
                  No resumes match this filter category
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
