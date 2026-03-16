// suggestionService.js - Generates resume improvement suggestions based on missing skills

const skillSuggestions = {
    'docker': 'Add Docker containerization experience if you have worked with containers',
    'aws': 'Mention AWS services such as EC2, S3 or Lambda if you have cloud experience',
    'react': 'Highlight React projects and component-based architecture experience',
    'node.js': 'Mention backend APIs or server-side applications built with Node.js',
    'mongodb': 'Add experience with MongoDB collections, schemas or aggregation pipelines',
    'javascript': 'Highlight JavaScript projects, ES6+ features, or vanilla JS experience',
    'typescript': 'Mention TypeScript usage in large-scale apps or type safety benefits',
    'express': 'Describe RESTful APIs or middleware implementation with Express',
    'mysql': 'Add experience with SQL queries, joins, or relational database design',
    'python': 'Highlight Python scripts, data analysis, or web apps with Flask/Django',
    'java': 'Mention Java Spring Boot apps, OOP principles, or enterprise development',
    'c++': 'Describe performance-critical systems or competitive programming experience',
    'html': 'Highlight semantic HTML5, accessibility, or responsive layouts',
    'css': 'Mention CSS Flexbox/Grid, animations, or preprocessors like SASS',
    'git': 'Add Git workflows, branching strategies, or CI/CD pipeline experience',
    'mysql': 'Add experience with SQL queries, joins, or relational database design'
};

function generateSuggestions(missingSkills) {
    if (!Array.isArray(missingSkills)) {
        return { suggestions: [] };
    }

    const suggestions = missingSkills
        .map(skill => skillSuggestions[skill])
        .filter(suggestion => suggestion !== undefined);

    return {
        suggestions
    };
}

module.exports = { generateSuggestions };

