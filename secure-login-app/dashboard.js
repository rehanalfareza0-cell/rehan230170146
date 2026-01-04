import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKuzytqMYm88X69HobzX_upGRCP5U-cOE",
  authDomain: "login-app-84740.firebaseapp.com",
  projectId: "login-app-84740",
  storageBucket: "login-app-84740.firebasestorage.app",
  messagingSenderId: "477858308718",
  appId: "1:477858308718:web:b7cfffbf51d16a08a5bc7f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.handleLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Gagal logout!');
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-name').textContent = user.displayName || 'User';
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('last-login').textContent = new Date().toLocaleString('id-ID');
    } else {
        window.location.href = 'index.html';
    }
});