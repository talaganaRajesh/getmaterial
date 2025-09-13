import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/moderate', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ flagged: false, error: 'No text provided' });
        }

        const response = await openai.moderations.create({
            input: text
        });

        const flagged = response.results[0].flagged;

        res.json({ flagged });
    } catch (error) {
        console.error('Moderation error:', error.message);
        res.status(500).json({ flagged: false, error: 'Moderation failed' });
    }
});

app.listen(5000, () => {
    console.log('Moderation server running on port 5000');
});
