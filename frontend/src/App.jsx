import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from './components/Dashboard';
import ContributorAuth from './components/ContributorAuth';
import Upload from './components/Upload';
import Navbar from './components/Navbar';

import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-green-100">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<ContributorAuth />} />
          <Route path="/upload" element={<Upload user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

