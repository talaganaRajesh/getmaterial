// server/test-drive-setup.js
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

async function testDriveSetup() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, 'google-drive-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    const driveService = google.drive({ version: 'v3', auth });

    // Test folder access
    const folder = await driveService.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'name,id'
    });

    console.log('Successfully connected to Google Drive!');
    console.log('Folder Name:', folder.data.name);
    console.log('Folder ID:', folder.data.id);

  } catch (error) {
    console.error('Error testing Drive setup:', error.message);
  }
}

testDriveSetup();