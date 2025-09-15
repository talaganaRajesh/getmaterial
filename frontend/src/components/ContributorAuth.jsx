import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/favicon.ico';
import axios from 'axios';
import './loader.css';



export default function ContributorAuth() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [passwordCreation, setPasswordCreation] = useState(false);
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // New loading state variables
  const [isLoading, setIsLoading] = useState({
    googleSignIn: false,
    sendOtp: false,
    verifyOtp: false,
    createAccount: false,
    signIn: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmailVerified(user.emailVerified);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(prev => ({ ...prev, googleSignIn: true }));
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the email ends with .edu
      if (!user.email.endsWith('.edu')) {
        // Sign out the user if they don't have an .edu email
        await auth.signOut();
        alert('Only .edu email addresses are allowed. Please use your college email account.');
        return;
      }
      
      navigate('/upload');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, googleSignIn: false }));
    }
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendOtpEmail = async (email, otp) => {
    setIsLoading(prev => ({ ...prev, sendOtp: true }));


    try {

      const apiKey = import.meta.env.VITE_BREVO_API_KEY;


      if (!apiKey) {
        throw new Error('Brevo API key is missing');
      }

      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email', 
        {
          sender: { 
            email:'useles436@gmail.com'
          },
          to: [{ email }],
          subject: 'Your OTP for Get Material Login',
          htmlContent: `
            <html>
              <body>
                <h2>Your One-Time Password (OTP)</h2>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
              </body>
            </html>
          `,
        }, 
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      console.log('OTP email sent successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Detailed OTP Email Error:', error);
      throw new Error('Failed to send OTP email');
    } finally {
      setIsLoading(prev => ({ ...prev, sendOtp: false }));
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();


    // EMAIL DOMAIN VALIDATION - Accept any .edu email
    if (!email.endsWith('.edu')) {
      alert('Only .edu email addresses are allowed. Please use your college email account.');
      return;
    }

    

    if (isSignUp) {
      try {
        setIsLoading(prev => ({ ...prev, verifyOtp: true }));
        const otp = generateOtp();
        setGeneratedOtp(otp);

        await sendOtpEmail(email, otp);
        setVerificationSent(true);
        setIsSignUp(false);
      } catch (error) {
        console.error('Email sending failed:', error);
        alert('Failed to send OTP. Please check your email and try again.');
      } finally {
        setIsLoading(prev => ({ ...prev, verifyOtp: false }));
      }
    } else {
      try {
        setIsLoading(prev => ({ ...prev, verifyOtp: true }));
        if (verificationSent && otp === generatedOtp) {
          setPasswordCreation(true);
          setVerificationSent(false);
        } else {
          alert('Incorrect OTP. Please try again.');
        }
      } finally {
        setIsLoading(prev => ({ ...prev, verifyOtp: false }));
      }
    }
  };

  const handlePasswordCreation = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password should be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, createAccount: true }));
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );

      const user = userCredential.user;
      console.log('User created successfully:', user);
      navigate('/upload');
    } catch (error) {
      console.error('Account creation error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert('Email is already registered. Please sign in.');
      } else {
        alert('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, createAccount: false }));
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    // EMAIL DOMAIN VALIDATION - Accept any .edu email
    if (!email.endsWith('.edu')) {
      alert('Only .edu email addresses are allowed. Please use your college email account.');
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, signIn: true }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in successfully:', user);
      navigate('/upload');
    } catch (error) {
      console.error('Sign-in error:', error);
      
      if (error.code === 'auth/invalid-credential') {
        alert('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        alert('No account found with this email. Please sign up.');
      } else {
        alert('Sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, signIn: false }));
    }
  };

  // Loader Component
  const Loader = () => (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setVerificationSent(false);
    setPasswordCreation(false);
    setIsSignUp(true);
    setIsSignInMode(false);
  };

  return (
    <div className="container mx-auto md:mt-20 mt-14 px-4 py-8">
      <div className="flex justify-center items-center">
        <img src={logo} alt="logo get material NIST Notes" width={80} height={80} />
        <h1 className="text-3xl font-bold">Account</h1>
      </div>
      <div className="max-w-md mx-auto bg-gradient-to-r login-container p-8 rounded-xl">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading.googleSignIn}
          className="w-full flex flex-row justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 bg-amber-50 items-center font-bold py-3 text-black rounded-2xl mb-4 transition-colors duration-300 disabled:opacity-50"
        >
          <lord-icon
            src="https://cdn.lordicon.com/eziplgef.json"
            trigger="loop"
          >
          </lord-icon>
          <span>Sign In with Google</span>
        </button>

        <h1 className='text-center text-black font-bold pb-4'>OR</h1>

        {/* Sign Up Flow */}
        {!isSignInMode && !passwordCreation && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              className="w-full p-3 border-2 rounded-lg font-semibold"
              required
              disabled={isLoading.sendOtp || isLoading.verifyOtp}
            />

            {!verificationSent && isSignUp && (
              <button
                type="submit"
                disabled={isLoading.sendOtp}
                className="w-full font-bold p-2 rounded-lg bg-gradient-to-r from-green-950 to-black text-white hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
              >
                {isLoading.sendOtp ? <Loader /> : 'Send OTP'}
              </button>
            )}

            {verificationSent && (
              <div>
                <div className="text-center text-green-500 mb-4">
                  OTP sent! Please check your mail inbox and enter the OTP to verify.
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full p-2 border-2 rounded-lg"
                  required
                  disabled={isLoading.verifyOtp}
                />
                <button
                  type="submit"
                  disabled={isLoading.verifyOtp}
                  className="w-full mt-2 font-bold p-2 rounded bg-gradient-to-r from-cyan-400 to-green-400 text-black hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
                >
                  {isLoading.verifyOtp ? <Loader /> : 'Verify OTP'}
                </button>
              </div>
            )}
          </form>
        )}

        {/* Password Creation Flow */}
        {passwordCreation && (
          <form onSubmit={handlePasswordCreation} className="space-y-4">
            <div className="text-center text-green-600 mb-4">
              Email verified! Now create your password
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create Password"
              className="w-full p-2 border-2 rounded-lg"
              required
              minLength={6}
              disabled={isLoading.createAccount}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full p-2 border-2 rounded-lg"
              required
              minLength={6}
              disabled={isLoading.createAccount}
            />
            <button
              type="submit"
              disabled={isLoading.createAccount}
              className="w-full font-bold p-2 rounded bg-gradient-to-r from-cyan-400 to-green-600 text-black hover:bg-green-600 transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading.createAccount ? <Loader /> : 'Create Account'}
            </button>
          </form>
        )}

        {/* Sign In Flow */}
        {isSignInMode && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border-2 rounded-lg font-semibold"
              required
              disabled={isLoading.signIn}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border-2 rounded-lg font-semibold"
              required
              disabled={isLoading.signIn}
            />
            <button
              type="submit"
              disabled={isLoading.signIn}
              className="w-full font-bold p-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-black transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading.signIn ? <Loader /> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Navigation Buttons */}
        <div className="mt-4 text-center">
          {!isSignInMode && !passwordCreation && (
            <button
              onClick={() => {
                resetForm();
                setIsSignInMode(true);
              }}
              className="text-red-950 font-semibold hover:underline"
            >
              Already have an account? Sign In
            </button>
          )}

          {isSignInMode && (
            <button
              onClick={() => {
                resetForm();
                setIsSignInMode(false);
              }}
              className="text-red-950 font-semibold hover:underline"
            >
              Need an account? Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}