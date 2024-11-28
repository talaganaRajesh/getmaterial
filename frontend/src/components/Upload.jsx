import { useState } from 'react';
// import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { auth, addNote } from '../firebase';


function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        setError('File size must be less than 500MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      setError('You must be authenticated to upload files.');
      alert('You must be authenticated to upload files. Redirecting to login page...');
      navigate('/auth');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('semester', semester);
    formData.append('subject', subject);

    try {
      const idToken = await user.getIdToken();
      const response = await axios.post('http://localhost:5001/upload', formData, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });



      // Prepare note data
      const noteData = {
        name: title,
        semester,
        subject,
        fileUrl: response.data.fileLink,
        fileId: response.data.fileId
      };

      // Add note to Firestore
      await addNote(noteData);






      console.log('Upload successful:', response.data);
      alert('File uploaded successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }



    // // Store note details in Firestore
    // const noteData = {
    //   title,
    //   semester,
    //   subject,
    //   fileId: driveResponse.data.fileId,
    //   fileLink: driveResponse.data.fileLink,
    //   uploadedBy: user.uid
    // };

    // // Use the addNote function from firebase.js
    // await addNote(noteData);






  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Note</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md bg-gradient-to-r from-green-200 to-emerald-200 p-6 rounded-lg mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-green-500"
            required
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject name"
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full ${uploading || !file
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
            } text-white p-2 rounded transition duration-200`}
        >
          {uploading ? 'Uploading...' : 'Upload Note'}
        </button>
      </form>
    </div>
  );
}

export default Upload;