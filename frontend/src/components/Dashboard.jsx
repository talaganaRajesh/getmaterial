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
      const response = await axios.get('http://localhost:5000');
      setNotes(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to fetch notes. Please try again later.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const semesters = Array.from(new Set(notes.map(note => note.semester))).sort((a, b) => a - b);
  const subjects = Array.from(new Set(notes.filter(note => !selectedSemester || note.semester === parseInt(selectedSemester)).map(note => note.subject))).sort();

  const filteredNotes = notes.filter(note => 
    (!selectedSemester || note.semester === parseInt(selectedSemester)) &&
    (!selectedSubject || note.subject === selectedSubject)
  );

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notes Dashboard</h1>
      <div className="mb-4 flex space-x-4">
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Semesters</option>
          {semesters.map(semester => (
            <option key={semester} value={semester}>Semester {semester}</option>
          ))}
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      {filteredNotes.length === 0 ? (
        <div className="text-center mt-8">No notes found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
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
      )}
    </div>
  );
}

export default Dashboard;

