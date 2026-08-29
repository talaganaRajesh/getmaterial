import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import ContributorAuth from './components/ContributorAuth';
import Upload from './components/Upload';
import Navbar from './components/Navbar';
import AboutMe from './components/AboutMe';
import NotePage from './components/NotePage';
import UserPage from './components/UserPage';

import Donate from './components/Donate';

import NotesContextProvider from './components/context/NotesContextProvider';
import SavedNotesContextProvider from './components/context/SavedNotesContextProvider';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);


  return (
    <NotesContextProvider>
      <SavedNotesContextProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-r flex items-center flex-col from-yellow-50 to-amber-50">
            <Navbar user={user} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<ContributorAuth />} />
              <Route path="/upload" element={<Upload user={user} />} />
              <Route path='/about' element={<AboutMe />} />
              <Route path='/note' element={<NotePage />} />
              <Route path='/userpage' element={<UserPage />} />
              <Route path='/donate' element={<Donate/>} />
            </Routes>
          </div>
        </Router>
      </SavedNotesContextProvider>
    </NotesContextProvider>
  );
}

export default App;

