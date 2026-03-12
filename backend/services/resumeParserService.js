const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractResumeText(filePath) {
    try {
        const ext = filePath.toLowerCase().split('.').pop();
        let extractedText = '';

        if (ext === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (ext === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            throw new Error('Unsupported file type. Use PDF or DOCX.');
        }

        return extractedText.trim();
    } catch (error) {
        throw new Error(`Error extracting text: ${error.message}`);
    }
}

module.exports = { extractResumeText };

