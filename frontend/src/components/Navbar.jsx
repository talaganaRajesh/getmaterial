import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
            <>
            <Link to="/auth" className="text-black font-bold bg-gradient-to-r from-cyan-400 to-green-500 py-3 px-4 rounded-lg hover:underline">
              Become a Contributor
            </Link>
            
            </>
              
          )}
        </div>
      </div>
      <div className='border-gray-300 border-2 '></div>
    </nav>
  );
}

export default Navbar;