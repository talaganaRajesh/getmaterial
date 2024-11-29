const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream'); // Import Readable for buffer handling
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Google Drive API with error handling
let drive;
try {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-drive-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive'], // Full access to Drive
  });
  drive = google.drive({ version: 'v3', auth });
  console.log('Google Drive API initialized successfully');
} catch (error) {
  console.error('Error initializing Google Drive API:', error);
}

app.use(cors());
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Upload request received');

  console.log('Request body:', req.body);
  
  if (!req.file) {
    console.log('No file in request');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.error('Google Drive folder ID not configured');
    return res.status(500).json({ message: 'Server configuration error: Folder ID missing' });
  }

  try {
    console.log('Preparing file upload:', req.file.originalname);

    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer), // Convert buffer to stream
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    console.log('File uploaded successfully:', response.data);

    res.status(200).json({
      message: 'File uploaded successfully',
      fileId: response.data.id,
      fileLink: response.data.webViewLink,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    googleDrive: drive ? 'initialized' : 'failed',
    folderConfigured: !!process.env.GOOGLE_DRIVE_FOLDER_ID
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
});
