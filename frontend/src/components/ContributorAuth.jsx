import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/GM logo 2.png';

function ContributorAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/upload');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (!email.endsWith('@nist.edu')) {
      alert('Please use your NIST email address');
      return;
    }
    if(email==='himanshu.mishra.cse.2022@nist.edu'){
      alert('You are not allowed to access this page');
      return;
    }


    try {


      const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=1e54deeedf3c4d29a2c974c127b67a9f&email=${email}`);
      const data = await response.json();

      // Check if the email is valid and exists
      if (data.deliverability !== "DELIVERABLE") {
        alert('The provided email address does not exist or cannot receive emails.');

        return;
      }




      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/upload');
    } catch (error) {
      console.error('Error with email authentication:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className='flex justify-center items-center'>
        <img src={logo} alt="logo" className='size-20' />
        <h1 className="text-3xl font-bold">Account</h1>
      </div>
      <div className="max-w-md mx-auto bg-cyan-50 p-8 rounded-xl">
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-gradient-to-r flex flex-row justify-center gap-2 items-center from-red-950 to-black font-bold py-4 text-white p-2 rounded mb-4 hover:bg-gradient-to-l transition-colors duration-300"
        >

          <lord-icon
            src="https://cdn.lordicon.com/eziplgef.json"
            trigger="hover"
          >
          </lord-icon>

          Sign in with Google
        </button>
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border-2 rounded-lg"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border-2 rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-green-500 text-black font-bold p-2 rounded hover:bg-blue-600"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-black hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
}

export default ContributorAuth;