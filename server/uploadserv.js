const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream'); // Import Readable for buffer handling
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

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

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Middleware to verify Firebase token and validate .edu email (enhanced diagnostics)
const verifyTokenAndEduEmail = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 'NO_TOKEN', message: 'No valid authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token, true); // enforce revocation check
    } catch (verifyErr) {
      console.error('verifyIdToken failed:', verifyErr?.code || verifyErr.message);
      return res.status(401).json({ code: 'VERIFY_FAILED', message: 'Invalid or expired token' });
    }

    if (!decodedToken.email || !decodedToken.email.endsWith('.edu')) {
      try {
        await admin.auth().deleteUser(decodedToken.uid);
        console.log(`Deleted unauthorized non-.edu account: ${decodedToken.email}`);
      } catch (deleteError) {
        console.error('Error deleting unauthorized user:', deleteError);
      }
      return res.status(403).json({
        code: 'NON_EDU_EMAIL',
        message: 'Access denied. Only .edu email addresses are allowed.',
        email: decodedToken.email || null
      });
    }

    if (!decodedToken.email_verified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Email not verified. Please verify your email before uploading files.'
      });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification middleware unexpected error:', error);
    return res.status(401).json({ code: 'UNEXPECTED', message: 'Authorization failed' });
  }
};



// Expanded CORS (adjust origin in production)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Upload endpoint with authentication
app.post('/', verifyTokenAndEduEmail, upload.single('file'), async (req, res) => {
  // console.log('Upload request received from verified user:', req.user.email);

  // console.log('Request body:', req.body);
  
  if (!req.file) {
    // console.log('No file in request');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    // console.error('Google Drive folder ID not configured');
    return res.status(500).json({ message: 'Server configuration error: Folder ID missing' });
  }

  try {
    // console.log('Preparing file upload:', req.file.originalname);

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

    // console.log('File uploaded successfully:', response.data);

    res.status(200).json({
      message: 'File uploaded successfully',
      fileId: response.data.id,
      fileLink: response.data.webViewLink,
      uploadedBy: req.user.email, // Log who uploaded
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
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
});
