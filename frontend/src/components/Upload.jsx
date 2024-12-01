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

  const [contributorName, setContributorName] = useState('');

  const [module, setModule] = useState('');


  const messages = [
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Why did the computer go to the doctor? Because it had a virus!",
    "Good things take time... just like this upload!",
    "Remember: Patience is a virtue. Stay with us!",
    "Why did the web developer go broke? Because he lost his cache.",
    "This upload is a marathon, not a sprint. Hang tight!",
    "Did you hear about the upload that walked into a bar? It still hasn't come out!",
  ];


  const [message, setMessage] = useState(messages[0]);



  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        setError('File size must be less than 500MB');
        return;
      }


      // Check if the file is a video
      if (selectedFile.type.startsWith('video/')) {
        setError('Video files are not allowed');
        return;
      }

      // Check if the file is an image
      if (selectedFile.type.startsWith('image/')) {
        setError('Image files are not allowed');
        return;
      }

      // Check if the file is audio/music
      if (selectedFile.type.startsWith('audio/')) {
        setError('Audio files are not allowed');
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
    formData.append('contributorName', contributorName);
    formData.append('module', module);


    // Start interval to change messages
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 5000); // Change message every 4 seconds



    try {


      const idToken = await user.getIdToken();
      const response = await axios.post('https://getmaterial-fq27.onrender.com', formData, {
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
        contributorName,
        module,
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
      clearInterval(interval); // Clear interval after upload
    }

  };

  return (
    <div className="container mx-auto px-4 pt-2 pb-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Note</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md bg-gradient-to-r from-green-200 to-emerald-200 p-6 rounded-lg mx-auto space-y-4">


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border-dashed border-black border rounded focus:ring-2 focus:ring-green-500"
            required
          />
        </div>



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
            Module
          </label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-full p-2 border rounded focus:ring-1 focus:ring-green-500"
            required
          >
            <option value="">Select Module</option>
            {["Module: 1", "Module: 2", "Module: 3", "Module: 4", "Module: 5", "assignments", "questions", "others"].map(mod => (
              <option key={mod} value={mod}>{mod}</option>
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
            Your Name (optional)
          </label>
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-green-500"
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

      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50">
          <div className="p-3 bg-yellow-100 border flex-col flex border-yellow-400 text-yellow-700 rounded transition-all duration-300 text-center w-[300px] md:right-10 right-3">
            <span className="text-green-600 text-center pb-2">uploading...</span>
            {message}
          </div>
        </div>
      )}





    </div>
  );
}

export default Upload;