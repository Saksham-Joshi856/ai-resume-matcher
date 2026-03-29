# Debugging Resume Search & Shortlist Issues

## Changes Made

### Enhanced Error Logging in Resume Controller

Added detailed error logging to the following functions:

1. **getAllResumes** - Logs user ID and number of resumes found
2. **searchResumes** - Now logs error details instead of generic message
3. **toggleShortlist** - Logs shortlist state changes and errors
4. **getShortlistedResumes** - Logs number of shortlisted resumes found

## How to Debug

### Step 1: Check Backend Console Logs

When you perform search/shortlist operations, check the backend terminal for logs like:

```
[GET_ALL] Fetching resumes for user: <userId>
[GET_ALL] Found X resumes

[SEARCH] Searching with skill: React
Search results: X resumes with IDs: [...]

[SHORTLIST_TOGGLE] Toggling shortlist for resume: <resumeId> user: <userId>
[SHORTLIST_TOGGLE] Shortlist updated to: true/false

[SHORTLISTED] Found X shortlisted resumes for user: <userId>
```

### Step 2: Common Issues & Solutions

**Issue: 500 error on search**
- Check: Is `req.userId` defined? (Should be set by authMiddleware)
- Check: Are resumes uploaded with skills extracted?
- Check: Is the MongoDB connection working?

**Issue: Cannot find shortlisted resumes**
- Verify: Resumes are actually shortlisted (toggle first)
- Check: userId matches between frontend token and backend

**Issue: Shortlist toggle not working**
- Verify: Resume ID is valid MongoDB ObjectId
- Verify: User owns that resume (userId match)
- Check: MongoDB is running and connected

### Step 3: Test Endpoints with Curl

```bash
# Test search endpoint
curl -H "Authorization: Bearer <your_token>" \
  "http://localhost:5000/api/resume/search?skill=React"

# Test shortlisted endpoint
curl -H "Authorization: Bearer <your_token>" \
  "http://localhost:5000/api/resume/shortlisted"

# Test get all resumes
curl -H "Authorization: Bearer <your_token>" \
  "http://localhost:5000/api/resume/all"
```

### Step 4: Check Database

```bash
# Connect to MongoDB
mongo

# Check resumes collection
db.resumes.find({userId: ObjectId("<your_userId>")})

# Check if skills are populated
db.resumes.findOne({}, {skills: 1, name: 1})
```

## Expected Flow

1. Upload resume → System extracts skills → Resume stored in DB
2. Search for skill → Backend queries by userId + skill filter
3. Toggle shortlist → Resume.shortlisted flag toggled true/false
4. Fetch shortlisted → Query all where shortlisted=true & userId matches

## If Issues Persist

1. Check backend terminal logs for actual error message
2. Verify auth token is valid and contains user ID
3. Clear browser cache and localStorage
4. Restart both backend and frontend servers
5. Check MongoDB connection string in .env
