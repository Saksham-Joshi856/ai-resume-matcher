// skillNormalizationService.js - Normalizes skill variations to standard names

const normalizationMap = {
    'nodejs': 'node.js',
    'node js': 'node.js',
    'node': 'node.js',
    'reactjs': 'react',
    'react js': 'react',
    'js': 'javascript',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'mongo db': 'mongodb',
    'mongo': 'mongodb',
    'mongo-db': 'mongodb',
    'mysql': 'mysql',
    'my sql': 'mysql',
    'express js': 'express',
    'expressjs': 'express',
    'docker': 'docker',
    'aws': 'aws',
    'html': 'html',
    'css': 'css',
    'git': 'git',
    'java': 'java',
    'python': 'python',
    'c++': 'c++',
    'cpp': 'c++'
};

function normalizeSkills(skills) {
    if (!Array.isArray(skills)) {
        return [];
    }

    const normalizedSet = new Set();

    skills.forEach(skill => {
        const lowerSkill = skill.toString().toLowerCase();
        const normalized = normalizationMap[lowerSkill] || lowerSkill;
        normalizedSet.add(normalized);
    });

    return Array.from(normalizedSet);
}

module.exports = { normalizeSkills };

