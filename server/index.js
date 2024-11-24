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
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Google Drive API
const drive = google.drive({ 
  version: 'v3', 
  auth: new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'google-drive-credentials.json'),
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
});

app.use(cors());
app.use(express.json());

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

app.post('/', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { title, semester, subject } = req.body;

  try {
    const folderName = `Semester ${semester}/${subject}`;
    const folderId = await createOrGetFolder(folderName);

    const fileMetadata = {
      name: title,
      parents: [folderId]
    };

    const media = {
      mimeType: req.file.mimetype,
      body: req.file.buffer
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Here you would typically save the file metadata to your database
    // For this example, we'll just send back the file details
    res.json({ 
      message: 'File uploaded successfully', 
      fileId: file.data.id, 
      fileUrl: file.data.webViewLink,
      title,
      semester,
      subject
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.get('/', async (req, res) => {
  // In a real application, you would fetch this data from your database
  // This is just a placeholder response
  res.json([
    { id: 1, title: 'Physics Note 1', semester: 1, subject: 'Physics', fileUrl: 'https://example.com/file1' },
    { id: 2, title: 'Math Note 1', semester: 1, subject: 'Math', fileUrl: 'https://example.com/file2' },
    { id: 3, title: 'Chemistry Note 1', semester: 2, subject: 'Chemistry', fileUrl: 'https://example.com/file3' },
    { id: 4, title: 'Biology Note 1', semester: 2, subject: 'Biology', fileUrl: 'https://example.com/file4' },
  ]);
});

async function createOrGetFolder(folderName) {
  const folderNames = folderName.split('/');
  let parentId = 'root';

  for (const name of folderNames) {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files.length > 0) {
      parentId = response.data.files[0].id;
    } else {
      const folderMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId]
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });
      parentId = folder.data.id;
    }
  }

  return parentId;
}

async function handleSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch({VITE_API_URL}, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('File uploaded successfully:', result);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
