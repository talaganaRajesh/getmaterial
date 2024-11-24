// server/config/googleDrive.js
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../path-to-your-google-drive-credentials.json'),
  scopes: SCOPES
});

const driveService = google.drive({ version: 'v3', auth });

async function uploadToDrive(file, metadata) {
  try {
    const fileMetadata = {
      name: metadata.title,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
      mimeType: file.mimetype,
      body: file.buffer
    };

    const response = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

module.exports = { uploadToDrive };

// server/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const { uploadToDrive } = require('./config/googleDrive');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./path-to-your-firebase-admin-sdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Upload endpoint
app.post('/api/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { title, semester, subject } = req.body;
    const userId = req.user.uid;

    const driveResponse = await uploadToDrive(file, { title });

    // Here you could save the file metadata to your database if needed
    const fileData = {
      title,
      semester,
      subject,
      userId,
      driveFileId: driveResponse.id,
      driveViewLink: driveResponse.webViewLink,
      uploadDate: new Date()
    };

    res.json({
      success: true,
      fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});