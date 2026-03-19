import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
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
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">AI Resume Matcher</h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload up to 10 resumes and compare them against a job description.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Resume Files (.pdf, .docx)
            </label>
            <input
              className="block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:cursor-pointer file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              type="file"
              multiple
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {selectedFileNames.length > 0 && (
              <ul className="mt-3 max-h-32 list-disc overflow-auto pl-5 text-sm text-slate-700">
                {selectedFileNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Job Description
            </label>
            <textarea
              className="h-36 w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
            />
          </div>
        </section>

        <section className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ranking..." : "Upload and Rank"}
          </button>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </button>
        </section>

        {error && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {successMessage && !error && (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        {topCandidate && (
          <section className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4">
            <h2 className="text-lg font-semibold text-emerald-900">Top Candidate</h2>
            <p className="mt-1 text-sm text-emerald-800">
              <span className="font-semibold">{topCandidate.name}</span> - Match Score: {topCandidate.matchScore}%
            </p>
          </section>
        )}

        <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Search Resumes By Skill</h2>
          <input
            type="text"
            placeholder="Search by skills (e.g. react node mongodb)"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          />

          <button
            onClick={handleSearch}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Search
          </button>

          {searchNotice && (
            <p className="mt-2 text-sm text-slate-600">{searchNotice}</p>
          )}
        </section>

        <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-amber-900">Shortlisted Resumes</h2>
          {shortlistedResumes.length === 0 ? (
            <p className="text-sm text-amber-800">
              {shortlistNotice || "No shortlisted resumes yet."}
            </p>
          ) : (
            <div className="space-y-2">
              {shortlistedResumes.map((r, index) => (
                <div
                  key={r._id || `${r.name}-${index}`}
                  className="rounded border border-amber-200 bg-white p-3 text-sm text-slate-800"
                >
                  <p className="font-medium">{r.name}</p>
                  {Array.isArray(r.skills) && r.skills.length > 0 && (
                    <p className="mt-1 text-xs text-slate-600">Skills: {r.skills.join(", ")}</p>
                  )}
                  <button
                    onClick={() => handleShortlist(r._id)}
                    className="mt-2 rounded bg-yellow-500 px-3 py-1 text-white"
                  >
                    Unshortlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {filteredResults.length > 0 && (
          <div className="w-full max-w-3xl mx-auto mt-6 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${filter === "all" ? "bg-gray-500 text-white" : "bg-gray-300"
                }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("top")}
              className={`px-3 py-1 rounded ${filter === "top" ? "bg-green-700 text-white" : "bg-green-500 text-white"
                }`}
            >
              Top (70+)
            </button>

            <button
              onClick={() => setFilter("medium")}
              className={`px-3 py-1 rounded ${filter === "medium" ? "bg-yellow-600 text-white" : "bg-yellow-500 text-white"
                }`}
            >
              Medium
            </button>

            <button
              onClick={() => setFilter("weak")}
              className={`px-3 py-1 rounded ${filter === "weak" ? "bg-red-700 text-white" : "bg-red-500 text-white"
                }`}
            >
              Weak
            </button>

            <button
              onClick={() => setFilter("shortlisted")}
              className={`px-3 py-1 rounded ${filter === "shortlisted" ? "bg-blue-700 text-white" : "bg-blue-500 text-white"
                }`}
            >
              Shortlisted
            </button>
          </div>
        )}

        {filteredResults.length > 0 && (
          <section className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
            <h2 className="mb-2 text-lg font-semibold text-green-900">Search Results</h2>
            <div className="space-y-2">
              {displayResults.map((r, index) => {
                const score = Number(r.matchScore ?? 0);
                const scoreClass =
                  score > 70
                    ? "bg-emerald-100 text-emerald-700"
                    : score < 30
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700";

                return (
                  <div
                    key={r._id || `${r.name}-${index}`}
                    className="rounded border border-green-200 bg-white p-3 text-sm text-slate-800"
                  >
                    <p className="font-medium">{r.name}</p>
                    <p className="mt-1 text-sm">
                      Score:{" "}
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${scoreClass}`}>
                        {score}
                      </span>
                    </p>
                    {Array.isArray(r.skills) && r.skills.length > 0 && (
                      <p className="mt-1 text-xs text-slate-600">Skills: {r.skills.join(", ")}</p>
                    )}
                    <button
                      onClick={() => handleShortlist(r._id)}
                      className="mt-2 rounded bg-yellow-500 px-3 py-1 text-white"
                    >
                      {r.shortlisted ? "Unshortlist" : "Shortlist"}
                    </button>
                  </div>
                );
              })}
            </div>
            {displayResults.length === 0 && (
              <p className="mt-2 text-sm text-slate-600">
                No resumes in this filter category.
              </p>
            )}
          </section>
        )}

        {rankedResumes.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-xl font-semibold text-slate-900">Ranked Resumes</h2>
            <div className="space-y-4">
              {rankedResumes.map((resume, index) => (
                <article
                  key={`${resume.name}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{resume.name}</h3>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      {resume.matchScore}%
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Matched Skills</h4>
                      <p className="mt-1 text-sm text-slate-700">
                        {resume.matchedSkills?.length
                          ? resume.matchedSkills.join(", ")
                          : "No matched skills detected."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Missing Skills</h4>
                      <p className="mt-1 text-sm text-slate-700">
                        {resume.missingSkills?.length
                          ? resume.missingSkills.join(", ")
                          : "No missing skills detected."}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">Suggestions</h4>
                      {resume.suggestions?.length ? (
                        <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
                          {resume.suggestions.map((suggestion, suggestionIndex) => (
                            <li key={`${resume.name}-${suggestionIndex}`}>{suggestion}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-sm text-slate-700">No suggestions available.</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
