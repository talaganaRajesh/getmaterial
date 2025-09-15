import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { auth, addNote, getNotes } from '../firebase';
import { normalizeForStorage, toTitleCase } from '../lib/utils';
import './loader.css'

import CustomSelect from './CustomSelect';

import PopUpMessage from "./PopUpMessage";

import { UploadIcon } from 'lucide-react';




function Upload() {
  const [subjects, setSubjects] = useState([]);



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
        setContributorName(user.displayName);
      } else {
        setContributorName("");
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);



  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('');
  // const [subject, setSubject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    const preAuthenticate = async () => {
  
      try {
        auth.onAuthStateChanged(async (user) => {  // Wait for auth state
          if (user) {
            await user.getIdToken();
          } else {
            console.log("No user authenticated");
          }
        });
      } catch (error) {
        console.error("Error pre-authenticating Google Drive:", error);
      }
    };
  
    preAuthenticate();
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
        const user = auth.currentUser;
        if (!user) {
          navigate('/auth');
          throw new Error('User not authenticated');
        }


        const idToken = await user.getIdToken();


        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await axios.post(
          'https://getmaterial-fq27.onrender.com',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const { fileLink, fileId } = response.data;

        // Save the uploaded file's link and ID to state
        setUploadedFileLink(fileLink);
        setUploadedFileId(fileId);

        setFileUploaded(true);
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Failed to upload file. Please try again by refreshing.');
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
    const user = auth.currentUser;

    if (!user) {
      setError('You must be authenticated to submit the form.');
      alert('Redirecting to login page...');
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
      <h1 className="text-3xl font-bold md:my-6 mb-3 text-center">Upload Note</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {notesUploaded && (
        <PopUpMessage
          message="Notes Uploaded 🎉🎉!"
          type="success" // 'info', 'error', 'warning', or 'success'
          duration={5000} // Duration in milliseconds
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
          />
          <label
            htmlFor="file-upload"
            className="w-full text-center items-center  flex justify-center p-4 border-dashed border-black cursor-pointer hover:bg-green-00 transition-all border rounded-xl focus:ring-2 focus:ring-green-500"
          >
            <UploadIcon className="inline-block mr-5 size-5 items-center" />
            Upload File

          </label>
          </div>
        </div>)}




        <div>
          {/* <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label> */}

          <CustomSelect
            options={subjects}
            placeholder={selectedSubject || "Select a subject"}
            onChange={(selectedOption) => setSelectedSubject(selectedOption)}
          />

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
          />
        </div>


        <button
          type="submit"
          disabled={uploading || !file || !fileUploaded}
          className={`w-full ${uploading || !file || !fileUploaded
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
            } text-black font-semibold  p-2 rounded-lg transition duration-200`}
        >
          {uploading ? 'Uploading...' : 'Upload Note'}
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





    </div>
  );
}

export default Upload;