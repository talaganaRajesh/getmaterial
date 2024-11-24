import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/notes');
      console.log('Response data:', response.data); // Debugging line to inspect response
      if (Array.isArray(response.data)) {
        setNotes(response.data);
        setError(null);
      } else {
        throw new Error('API returned a welcome message instead of notes.');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error fetching notes: {error.message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
            <p className="text-gray-600 mb-2">Semester: {note.semester}</p>
            <p className="text-gray-600 mb-2">Subject: {note.subject}</p>
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Note
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
