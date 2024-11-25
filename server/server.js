const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();  // Load environment variables

const app = express();

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: 'google-drive-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// Middleware
app.use(cors());
app.use(express.json());

// Notes endpoint: Retrieve files from a specific Google Drive folder
app.get('/notes', async (req, res) => {
  try {
    // Get the folder ID from environment variables
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Extract only the folder ID from the URL if it's a full URL
    const match = folderId.match(/folders\/([a-zA-Z0-9_-]+)/);
    const cleanFolderId = match ? match[1] : folderId;

    const response = await drive.files.list({
      q: `'${cleanFolderId}' in parents and mimeType!='application/vnd.google-apps.folder'`,
      fields: 'files(id, name, webViewLink)',
    });

    const files = response.data.files;
    if (files.length === 0) {
      return res.status(404).json({ message: 'No files found in the folder' });
    }

    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.name,
      fileUrl: file.webViewLink,  // Direct link to view in Google Drive
    }));

    res.status(200).json(formattedFiles);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ message: 'Error retrieving files', error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
