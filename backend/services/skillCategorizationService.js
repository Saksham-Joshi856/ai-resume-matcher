// skillCategorizationService.js - Categorizes skills into frontend/backend/database/devops

const categoryMap = {
    frontend: ['react', 'html', 'css', 'javascript', 'typescript'],
    backend: ['node.js', 'express', 'python', 'java', 'c++'],
    database: ['mongodb', 'mysql', 'postgresql'],
    devops: ['docker', 'aws', 'git', 'kubernetes']
};

function categorizeSkills(skills) {
    if (!Array.isArray(skills)) {
        return {
            frontend: [],
            backend: [],
            database: [],
            devops: []
        };
    }

    const categories = {
        frontend: [],
        backend: [],
        database: [],
        devops: []
    };

    // Reverse lookup: skill to category
    const skillToCategory = {};
    Object.entries(categoryMap).forEach(([cat, catSkills]) => {
        catSkills.forEach(skill => {
            skillToCategory[skill] = cat;
        });
    });

    skills.forEach(skill => {
        const category = skillToCategory[skill];
        if (category && !categories[category].includes(skill)) {
            categories[category].push(skill);
        }
    });

    return categories;
}

module.exports = { categorizeSkills };

