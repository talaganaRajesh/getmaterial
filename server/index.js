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

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

app.get('/notes', (req, res) => {
  const notes = [
    { id: 1, subject: 'Math', fileUrl: 'http://example.com/note1.pdf' },
    { id: 2, subject: 'Science', fileUrl: 'http://example.com/note2.pdf' }
  ];
  res.status(200).json(notes);
});

async function createOrGetFolder(folderName) {
  const folderNames = folderName.split('/');
  let parentId = 'root';

  for (const name of folderNames) {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files.length > 0) {
      parentId = response.data.files[0].id;
    } else {
      const folderMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      };
      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id',
      });
      parentId = folder.data.id;
    }
  }

  return parentId;
}

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
