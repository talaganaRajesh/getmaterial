const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-admin-sdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Google Drive API
const drive = google.drive({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    keyFile: 'google-drive-credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
  }),
});

// Middleware
app.use(cors());
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

// Notes endpoint
app.get('/notes', (req, res) => {
  // Example response, replace with your actual logic
  const notes = [
    { id: 1, title: 'Math Notes', semester: 'Fall 2021', subject: 'Math', fileUrl: 'http://example.com/note1.pdf' },
    { id: 2, title: 'Science Notes', semester: 'Spring 2021', subject: 'Science', fileUrl: 'http://example.com/note2.pdf' },
  ];
  res.status(200).json(notes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
