import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import { Readable } from 'stream';  // Import Readable for buffer handling
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// // Initialize Google Drive API with error handling
// let drive;
// try {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: path.join(__dirname, 'google-drive-credentials.json'),
//     scopes: ['https://www.googleapis.com/auth/drive'], // Full access to Drive
//   });
//   drive = google.drive({ version: 'v3', auth });
//   console.log('Google Drive API initialized successfully');
// } catch (error) {
//   console.error('Error initializing Google Drive API:', error);
// }



// Initialize Google Drive API with credentials from .env

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

app.use(cors());
app.use(express.json());

app.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    return res.status(500).json({ message: 'Server configuration error: Folder ID missing' });
  }

  try {
    const fileMetadata = {
      name: req.file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    res.status(200).json({
      message: 'File uploaded successfully',
      fileId: response.data.id,
      fileLink: response.data.webViewLink,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    googleDrive: drive ? 'initialized' : 'failed',
    folderConfigured: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
});
