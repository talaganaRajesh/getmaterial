import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { signOut } from 'firebase/auth';
import { auth, addNote, getNotes } from '../firebase';
import { normalizeForStorage, toTitleCase } from '../lib/utils';
import './loader.css'

import CustomSelect from './CustomSelect';

import PopUpMessage from "./PopUpMessage";

import { UploadIcon } from 'lucide-react';




function Upload() {
  const [subjects, setSubjects] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();




  useEffect(() => {


    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();

        // Keep original case for subjects (they're now stored lowercase)
        const normalizedNotes = fetchedNotes.map(note => ({
          ...note,
          subject: note.subject || '',
        }));


        // Extract unique subjects and format for display
        const fetchedsubjects = [...new Set(normalizedNotes.map(note => note.subject))];

        // Convert to title case for display, but keep the original lowercase value
        const formattedSubjects = fetchedsubjects.map(subject => toTitleCase(subject));
        formattedSubjects.sort();
        formattedSubjects.push('Not mentioned');

        setSubjects(formattedSubjects);

      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError(error.message);
      }
    };

    fetchNotes();


  }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setContributorName(user.displayName || user.email || 'Anonymous');
        setIsAuthenticated(true);
      } else {
        setContributorName("");
        setIsAuthenticated(false);
      }
      setAuthLoading(false);
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Separate effect to handle redirects after auth state is determined
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError(''); // Clear any previous errors
      navigate('/auth');
    } else if (!authLoading && isAuthenticated) {
      setError(''); // Clear auth-related errors when authenticated
    }
  }, [authLoading, isAuthenticated, navigate]);



  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('');
  // const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [contributorName, setContributorName] = useState('');

  const [module, setModule] = useState('');

  const messages = [
    "Uploading... slower than my grandma's Wi-Fi!",
    "Hold up, the bytes are arguing.",
    "Almost there... if 'there' is still far!",
    "Loading... as reliable as my alarm clock.",
    "Hang tight... I bribed the server with cookies!",
    "This upload is practicing yoga. Namaste!",
    "Loading... because teleportation is not an option!",
    "Uploading... one byte at a time, literally!",
    "Oops, the pixels went on a coffee break!",
    "Patience, the file’s catching its breath!",
    "99% done... like my eternal procrastination!",
    "Uploading... like it’s dragging its feet home.",
    "Relax, the file's just stuck in traffic!",
    "Loading... it’s in no rush, unlike you.",
    "Uploading... fueled by hopes and prayers.",
    "Processing... with the speed of a sloth!",
    "Just a sec... or maybe an eternity.",
    "Uploading... trying to find the right vibe!",
    "Loading... it's waiting for applause!",
    "Uploading... slower than me on a treadmill.",
    "Oops, the bytes took a wrong turn!",
    "This upload’s in the queue behind a snail.",
    "Almost done... or am I lying?",
    "Uploading... because teleporting bytes is illegal.",
    "Waiting... because why not?",
    "Hold on, it’s buffering its confidence.",
    "Uploading... powered by hamster wheels!",
    "Relax, it’s on bytecation.",
    "Loading... slower than my last breakup.",
    "This upload’s stuck in existential dread!",
    "Uploading... we’re counting sheep, too!",
    "Hold up... the bytes are stretching first.",
    "Uploading... not running, just strolling.",
    "Bytes loading... but first, a selfie!",
    "Processing... the bytes are shy today.",
    "Uploading... slower than a dial-up modem.",
    "Relax, the bytes are on union break!",
    "Almost there... on a cosmic timeline.",
    "Uploading... the file’s learning patience.",
    "Oops, it took the scenic route!",
    "Loading... it's meditating on life choices.",
    "Uploading... like it’s writing a novel.",
    "Pixels stuck in a philosophical debate.",
    "Uploading... slower than me before coffee.",
    "Processing... powered by wishful thinking!",
    "Hold tight... the bytes are gossiping!",
    "Uploading... powered by good vibes only.",
    "Almost done... just redefining 'almost.'",
    "Uploading... even turtles are laughing!",
    "Loading... it’s probably napping!",
    "Uploading... let’s just hope for the best.",
    "Relax... the bytes are on their way!"
  ];




  const [message, setMessage] = useState(messages[Math.floor(Math.random() * messages.length)]);


  useEffect(()=>{
    const interval=setInterval(()=>{
      const index=Math.floor(Math.random() * messages.length);
      setMessage(messages[index]);

    },4000);

    return ()=>clearInterval(interval);
  },[]);


  const [uploadedFileLink, setUploadedFileLink] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState('');

  const [fileUploading, setFileUploading] = useState(false);

  const [fileUploaded, setFileUploaded] = useState(false);

  const [notesUploaded, setNotesUploaded] = useState(false);



  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User authenticated:", user.email);
        try {
          // Pre-fetch token to warm up authentication
          await user.getIdToken();
        } catch (error) {
          console.error("Error pre-fetching token:", error);
        }
      } else {
        console.log("No user authenticated");
      }
    });

    return () => unsubscribe();
  }, []);
  


  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit
        setError('File size must be less than 500MB');
        return;
      }

      if (selectedFile.type.startsWith('video/')) {
        setError('Video files are not allowed');
        return;
      }

      if (selectedFile.type.startsWith('audio/')) {
        setError('Audio files are not allowed');
        return;
      }

      setFile(selectedFile);
      setError(null);

      try {

        setFileUploaded(false);
        setFileUploading(true);


        // Upload file to Google Drive
        if (!isAuthenticated || authLoading) {
          setError('Please wait while we verify your authentication...');
          return;
        }

        const user = auth.currentUser;
        if (!user) {
          setError('Authentication required. Redirecting to login...');
          navigate('/auth');
          return;
        }

        // Check if user email ends with .edu
        if (!user.email || !user.email.endsWith('.edu')) {
          setError('Only .edu email addresses are allowed. Please use your college email.');
          await auth.signOut();
          navigate('/auth');
          return;
        }

        console.log('Attempting to get ID token for user:', user.email);
        const idToken = await user.getIdToken(true); // Force refresh token
        console.log('Token obtained successfully');


        const formData = new FormData();
        formData.append('file', selectedFile);

        const attemptUpload = async (token) => {
          console.log('Attempting upload with token');
          return axios.post(
            'https://getmaterial-fq27.onrender.com',
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              timeout: 300000, // 5 minutes timeout
            }
          );
        };

        let response;
        try {
          console.log('Making first upload attempt...');
          response = await attemptUpload(idToken);
          console.log('Upload successful:', response.data);
        } catch (err) {
          console.error('First upload attempt failed:', err?.response?.status, err?.response?.data);
          if (err?.response?.status === 401) {
            try {
              console.log('Token expired, refreshing...');
              const fresh = await user.getIdToken(true); // force refresh
              console.log('New token obtained, retrying upload...');
              response = await attemptUpload(fresh);
              console.log('Retry upload successful:', response.data);
            } catch (retryErr) {
              console.error('Retry upload failed:', retryErr?.response?.status, retryErr?.response?.data);
              // Token refresh failed, user needs to re-authenticate
              await auth.signOut();
              navigate('/auth');
              setError('Your session has expired. Please log in again.');
              return;
            }
          } else {
            throw err;
          }
        }

        const { fileLink, fileId } = response.data;

        // Save the uploaded file's link and ID to state
        setUploadedFileLink(fileLink);
        setUploadedFileId(fileId);

        setFileUploaded(true);
      } catch (error) {
        console.error('Error uploading file:', error);
        if (error?.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (error?.response?.status === 403) {
          const code = error?.response?.data?.code;
          if (code === 'NON_EDU_EMAIL') {
            setError('Upload blocked: only .edu emails allowed.');
          } else {
            setError('Access denied (403).');
          }
        } else {
          setError('Failed to upload file. Please refresh and try again.');
        }
        setFileUploaded(false)
      }

    }
  };


  const [selectedSubject, setSelectedSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // Ref for the new subject input field
  const newSubjectInputRef = useRef(null);

  // Auto-focus the input when "Not mentioned" is selected
  useEffect(() => {
    if (selectedSubject === 'Not mentioned' && newSubjectInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        newSubjectInputRef.current.focus();
      }, 100);
    }
  }, [selectedSubject]);


  const handleAddSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
      setSelectedSubject(newSubject);
      setNewSubject('');
    } else {
      setError('Subject already exists or is empty'); // Use state instead of alert
    }
  };

  // Function to get the actual subject name to submit
  const getSubjectForSubmission = () => {
    if (selectedSubject === 'Not mentioned') {
      return normalizeForStorage(newSubject.trim() || '');
    }
    return normalizeForStorage(selectedSubject);
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authLoading) {
      setError('Please wait while we verify your authentication...');
      return;
    }

    if (!isAuthenticated) {
      setError('You must be authenticated to submit the form.');
      navigate('/auth');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Authentication error. Please log in again.');
      navigate('/auth');
      return;
    }

    // Get the actual subject to use for submission
    const subjectToSubmit = getSubjectForSubmission();
    
    // Validate that we have a subject
    if (!subjectToSubmit) {
      setError('Please select a subject or enter a new subject name.');
      return;
    }

    // if (!uploadedFileLink || !uploadedFileId) {
    //   setError('File Uploading... please wait || select a file if not selected.');
    //   return;
    // }

    if (fileUploading) {
      setUploading(true);
    }

    if (!fileUploaded) {
      setUploading(true);
    };

    setError(null);

    try {
      // Prepare the note data with pre-uploaded file details
      const noteData = {
        name: title,
        semester,
        subject: subjectToSubmit,
        contributorName,
        module,
        fileUrl: uploadedFileLink,
        fileId: uploadedFileId,
        likes: 0,
      };

      // Add note to Firestore
      await addNote(noteData);

      console.log('Form submitted successfully.');

      setNotesUploaded(true);

      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Submission failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="container mx-auto md:mt-20 mt-24 px-4 pt-2">
      {authLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Verifying authentication...</p>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">Authentication required</p>
            <p className="text-gray-600">Redirecting to login page...</p>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold md:my-6 mb-3 text-center">Upload Note</h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {notesUploaded && (
            <PopUpMessage
              message="Notes Uploaded 🎉🎉!"
              type="success"
              duration={5000}
            />
          )}

          <form onSubmit={handleSubmit} className="upload-container max-w-md bg-gradient-to-r px-8 py-7 rounded-2xl mx-auto space-y-4">

        {fileUploading ? (

          <div>
            {fileUploaded ? (
              <div className='border-dashed border-black border rounded-xl p-3'>
                <p className=' text-green-500 font-bold text-center'>Uploaded 🎉</p>
                <p className='text-gray-500 text-sm text-center font-semibold'>click Upload Note !</p>
                <PopUpMessage
                  message="SUBMIT NOW! ,File uploaded ✅!"
                  type="success" // 'info', 'error', 'warning', or 'success'
                // Duration in milliseconds
                />
              </div>

            ) : (
              <div className='border-dashed border-black border flex flex-col justify-center items-center rounded-xl p-3'>

                <div className='justify-center flex items-center'>
                  <p className=' text-red-500 text-center font-bold  '>uploading...</p>
                  <p className='loader2 text-center flex align-middle justify-center'></p>
                </div>
                <p className='text-gray-500 text-sm text-center font-semibold'>please wait ! Don't submit</p>
              </div>
            )}
          </div>

        ) : (<div>
          
          <div className='flex justify-center hover:bg-yellow-50 transition-all'>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={!isAuthenticated || authLoading}
          />
          <label
            htmlFor="file-upload"
            className={`w-full text-center items-center flex justify-center p-4 border-dashed border-black cursor-pointer hover:bg-green-00 transition-all border rounded-xl focus:ring-2 focus:ring-green-500 ${
              !isAuthenticated || authLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <UploadIcon className="inline-block mr-5 size-5 items-center" />
            {authLoading ? 'Verifying...' : !isAuthenticated ? 'Authentication Required' : 'Upload File'}
          </label>
          </div>
        </div>)}




        <div>
          {/* <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label> */}

          <div className={`relative ${!isAuthenticated || authLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <CustomSelect
              options={subjects}
              placeholder={selectedSubject || "Select a subject"}
              onChange={(selectedOption) => setSelectedSubject(selectedOption)}
            />
            {(!isAuthenticated || authLoading) && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {authLoading ? 'Verifying...' : 'Authentication required'}
                </span>
              </div>
            )}
          </div>

          {/* Conditionally render the input field when 'Not mentioned' is selected */}
          {selectedSubject === 'Not mentioned' && (
            <div className="mt-2">
              <input
                ref={newSubjectInputRef}
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter new subject name..."
                className="w-full p-2 border-2 border-green-500 rounded-lg focus:ring-1 focus:ring-green-500"
                required
                disabled={!isAuthenticated || authLoading}
              />
              
            </div>
          )}
        </div>







        <div className='flex gap-5'>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label> */}

            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 border md:hover:bg-yellow-50 cursor-pointer transition-all border-gray-400 rounded-lg"
              required
              disabled={!isAuthenticated || authLoading}
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>

          </div>

          <div>
            {/* <label className="block text-sm font-medium text-gray-700 mb-1">
              Module
            </label> */}
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full p-2 border-gray-400 md:hover:bg-yellow-50 cursor-pointer transition-all border rounded-lg"
              required
              disabled={!isAuthenticated || authLoading}
            >
              <option value="">Select Module</option>
              {["Module: 1", "Module: 2", "Module: 3", "Module: 4", "Module: 5", "assignment 1","assignment 2","All modules","Module: 1,2","Module: 2,3","Module: 3,4","Module: 4,5","Book", "questions", "others"].map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            College Name/Details
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: NIST college , Class notes"
            className="w-full p-2 border rounded-lg focus:ring-1 font-semibold"
            required
            disabled={!isAuthenticated || authLoading}
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
            className="w-full p-2 font-semibold border rounded-lg focus:ring-1"
            disabled={!isAuthenticated || authLoading}
          />
        </div>


        <button
          type="submit"
          disabled={uploading || !file || !fileUploaded || !isAuthenticated || authLoading}
          className={`w-full ${uploading || !file || !fileUploaded || !isAuthenticated || authLoading
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
            } text-black font-semibold  p-2 rounded-lg transition duration-200`}
        >
          {authLoading ? 'Verifying...' : !isAuthenticated ? 'Authentication Required' : uploading ? 'Uploading...' : 'Upload Note'}
        </button>
      </form>

      {fileUploading && !fileUploaded && (
        <div className='bg-yellow-50 pb-5 px-3 md:right-20 w-fit md:absolute md:top-1/2'>
          <div className='mt-5 h-20 md:h-0'>
            <p className='text-center text-emerald-700 font-semibold'>{message}</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 transition-all z-50">
          <h1 className='loader'></h1>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default Upload;