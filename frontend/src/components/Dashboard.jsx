import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/notes');
      setNotes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error fetching notes: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{note.title}</h2>
            <p className="text-gray-600 mb-2">Semester: {note.semester}</p>
            <p className="text-gray-600 mb-2">Subject: {note.subject}</p>
            <a
              href={note.fileUrl}
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