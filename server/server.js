require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());

// Moderation Endpoint
app.post('/moderate', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Extract text from PDF
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text.slice(0, 2000); // limit length for moderation API

        // Call OpenAI Moderation API
        const response = await openai.createModeration({
            input: text,
        });

        const result = response.data.results[0];
        const flagged = result.flagged;

        // Cleanup file after reading
        fs.unlinkSync(file.path);

        if (flagged) {
            return res.status(400).json({
                flagged: true,
                message: 'The file contains inappropriate content.',
            });
        }

        return res.json({
            flagged: false,
            message: 'The file is safe to upload.',
        });

    } catch (error) {
        console.error('Moderation error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
