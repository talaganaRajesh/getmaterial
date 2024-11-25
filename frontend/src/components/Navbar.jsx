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
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">
          Note Sharing App
        </Link>
        <div>
          {user ? (
            <>
              <Link to="/upload" className="text-white mr-4 hover:underline">
                Upload
              </Link>
              <button onClick={handleSignOut} className="text-white hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-white hover:underline">
              Become a Contributor
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;