import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Github } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@headlessui/react';

import './loader.css'

function Navbar({ user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  const [stars, setStars] = useState(0);

  useEffect(() => {
    // Replace 'username/repo' with your actual GitHub repository path
    fetch('https://api.github.com/repos/talaganaRajesh/getmaterial')
      .then(response => response.json())
      .then(data => setStars(data.stargazers_count))
      .catch(error => console.error('Error fetching GitHub stats:', error));
  }, []);


  return (
    <nav className="bg-black">
      <div className="container mx-auto flex justify-between p-4 items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Get <span className='text-green-400'>Material</span>
        </Link>
        <div>
          {user ? (
            <>
              <Link to="/upload" className="text-black bg-white py-2 px-5 border-white border-4 rounded-3xl mr-4 font-semibold hover:rounded-xl transition-all duration-300">
                Upload
              </Link>
              <button onClick={handleSignOut} className="text-white bg-black opacity-80 font-semibold py-2 px-4 rounded-lg hover:text-red-500 transition-colors duration-300">
                Sign Out
              </button>
            </>
          ) : (
            <div className='flex justify-center'>
              <Link to="/auth" className="text-black font-bold bg-gradient-to-r from-cyan-400 to-green-500 py-3 px-4 rounded-lg hover:underline">
                Become a Contributor
              </Link>

              {/* GitHub Button */}
              <Button className="px-3 md:px-3">
                <a
                  href="https://github.com/talaganaRajesh/getmaterial.git" // Replace with your actual repo URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex group relative bg-gray-100 p-3 rounded-lg items-center gap-1 text-white"
                >
                  <Github size={16} className="md:size-6 text-black" />
                  <span className="tooltip absolute top-full w-1/3 transform -translate-x-1/2 mt-2 py-2 px-1 bg-gray-300 text-black text-xs rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    star on github
                  </span>
                  <span className="font-semibold text-black text-sm md:text-base">{stars}</span>
                </a>
              </Button>

            </div>

          )}
        </div>
      </div>
      <div className='border-gray-300 border-2 '></div>
    </nav>
  );
}

export default Navbar;