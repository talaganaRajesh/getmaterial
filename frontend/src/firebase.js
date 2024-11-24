import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBShbEHeY2aPY2sx8NDoFrqqBtMztEVuzQ",
    authDomain: "material-web-app-5af17.firebaseapp.com",
    projectId: "material-web-app-5af17",
    storageBucket: "material-web-app-5af17.firebasestorage.app",
    messagingSenderId: "366377409289",
    appId: "1:366377409289:web:31371992ec5ec4e8fb91d8",
    measurementId: "G-WG5LX7Z162"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
