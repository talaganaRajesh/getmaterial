import { useState, useEffect } from 'react';
import axios from 'axios';

import { getNotes } from '../firebase';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [titleFilter, setTitleFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Unique semesters and subjects for dropdowns
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
        
        // Extract unique semesters and subjects
        const semesters = [...new Set(fetchedNotes.map(note => note.semester))];
        const subjects = [...new Set(fetchedNotes.map(note => note.subject))];
        
        setUniqueSemesters(semesters);
        setUniqueSubjects(subjects);
        
        setError(null);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Filter effect
  useEffect(() => {
    // Apply filters
    const filtered = notes.filter(note => 
      note.name.toLowerCase().includes(titleFilter.toLowerCase()) &&
      (semesterFilter === '' || note.semester === semesterFilter) &&
      (subjectFilter === '' || note.subject === subjectFilter)
    );

    setFilteredNotes(filtered);
  }, [notes, titleFilter, semesterFilter, subjectFilter]);

  // Reset filters
  const resetFilters = () => {
    setTitleFilter('');
    setSemesterFilter('');
    setSubjectFilter('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">All Notes</h1>
      
      {/* Filter Panel */}
      <div className="mb-6 bg-gray-100 p-4 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Title Filter */}
          <div>
            <label htmlFor="titleFilter" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input 
              type="text" 
              id="titleFilter"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              placeholder="Search by title"
              className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          {/* Semester Filter */}
          <div>
            <label htmlFor="semesterFilter" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select 
              id="semesterFilter"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label htmlFor="subjectFilter" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <select 
              id="subjectFilter"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="mt-1 p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

        {/* Reset Filters Button */}
        <div className="mt-4 p-3 text-center">
          <button 
            onClick={resetFilters}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
        </div>
      </div>

      {loading && <p className='text-green-600 text-center font-bold'>Loading...</p>}
      {error && <p className="text-red-500">Error fetching notes: {error}</p>}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{note.name}</h2>
            <p className="text-gray-600 mb-2">Semester: {note.semester}</p>
            <p className="text-gray-600 mb-4">Subject: {note.subject}</p>
            <a
              href={note.fileUrl}
              rel="noopener noreferrer"
              className="text-white bg-black py-2 px-3 rounded-lg hover:rounded-2xl transition-all duration-300"
            >
              View Note
            </a>
          </div>
        ))}

        {/* No results message */}
        {filteredNotes.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No notes found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;