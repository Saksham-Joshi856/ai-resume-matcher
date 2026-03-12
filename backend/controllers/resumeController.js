const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');


const uploadResume = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
        const filePath = req.file.path;
        const ext = req.file.originalname.toLowerCase().split('.').pop();
        let extractedText = '';
        if (ext === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;

        } else if (ext === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            return res.status(400).json({ message: "Unsupported file type. Use PDF or DOCX" });
        }
        res.json({ message: "Resume processed", text: extractedText.trim() });
    } catch (error) {
        res.status(500).json({ message: "Error processing resume" });
    }
};


module.exports = { uploadResume };

