import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
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


const loginAttempts = {
    count: 0,
    maxAttempts: 3,
    blockTime: 300000, 
    blockedUntil: null
};


function loadLoginAttempts() {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
        const data = JSON.parse(stored);
        loginAttempts.count = data.count || 0;
        loginAttempts.blockedUntil = data.blockedUntil || null;
    }
}

function saveLoginAttempts() {
    localStorage.setItem('loginAttempts', JSON.stringify({
        count: loginAttempts.count,
        blockedUntil: loginAttempts.blockedUntil
    }));
}

function isUserBlocked() {
    if (loginAttempts.blockedUntil) {
        const now = Date.now();
        if (now < loginAttempts.blockedUntil) {
            const remainingTime = Math.ceil((loginAttempts.blockedUntil - now) / 60000);
            return remainingTime;
        } else {
            
            loginAttempts.count = 0;
            loginAttempts.blockedUntil = null;
            saveLoginAttempts();
            return false;
        }
    }
    return false;
}

function updateLoginAttemptsDisplay() {
    const attemptsDiv = document.getElementById('login-attempts');
    const blockedTime = isUserBlocked();
    
    if (blockedTime) {
        attemptsDiv.innerHTML = `⚠️ Terlalu banyak percobaan login gagal! Akun diblokir selama ${blockedTime} menit.`;
        attemptsDiv.classList.add('show');
    } else if (loginAttempts.count > 0) {
        const remaining = loginAttempts.maxAttempts - loginAttempts.count;
        attemptsDiv.innerHTML = `⚠️ Percobaan login gagal: ${loginAttempts.count}/${loginAttempts.maxAttempts}. Sisa kesempatan: ${remaining}`;
        attemptsDiv.classList.add('show');
    } else {
        attemptsDiv.classList.remove('show');
    }
}

window.showTab = function(tabName, clickedButton) {
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-form`).classList.add('active');
    
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    hideMessage();
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message show ${type}`;
    
    setTimeout(() => {
        hideMessage();
    }, 5000);
}


function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.classList.remove('show');
}


window.handleRegister = async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        showMessage('Password tidak cocok!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password minimal 6 karakter!', 'error');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
        await updateProfile(userCredential.user, {
            displayName: name
        });
        
        showMessage('Registrasi berhasil! Silakan login.', 'success');
        
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        
        setTimeout(() => {
            document.querySelector('.tab:first-child').click();
        }, 2000);
        
    } catch (error) {
        let errorMessage = 'Registrasi gagal!';
        
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email sudah terdaftar!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid!';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password terlalu lemah!';
                break;
        }
        
        showMessage(errorMessage, 'error');
        console.error('Registration error:', error);
    }
}

window.handleLogin = async function(event) {
    event.preventDefault();
    
    const blockedTime = isUserBlocked();
    if (blockedTime) {
        showMessage(`Akun diblokir! Coba lagi dalam ${blockedTime} menit.`, 'error');
        updateLoginAttemptsDisplay();
        return;
    }
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        loginAttempts.count = 0;
        loginAttempts.blockedUntil = null;
        saveLoginAttempts();
        
        showMessage('Login berhasil! Mengalihkan...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        loginAttempts.count++;
        
        if (loginAttempts.count >= loginAttempts.maxAttempts) {
            loginAttempts.blockedUntil = Date.now() + loginAttempts.blockTime;
            showMessage(`Terlalu banyak percobaan gagal! Akun diblokir selama 5 menit.`, 'error');
        } else {
            let errorMessage = 'Login gagal!';
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email tidak terdaftar!';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password salah!';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid!';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Terlalu banyak percobaan! Coba lagi nanti.';
                    loginAttempts.blockedUntil = Date.now() + loginAttempts.blockTime;
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Email atau password salah!';
                    break;
            }
            
            showMessage(errorMessage, 'error');
        }
        
        saveLoginAttempts();
        updateLoginAttemptsDisplay();
        console.error('Login error:', error);
    }
}

window.handleForgotPassword = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    try {
        await sendPasswordResetEmail(auth, email);
        showMessage('Link reset password telah dikirim ke email Anda!', 'success');
        document.getElementById('forgot-email').value = '';
    } catch (error) {
        let errorMessage = 'Gagal mengirim email reset!';
        
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Email tidak terdaftar!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format email tidak valid!';
                break;
        }
        
        showMessage(errorMessage, 'error');
        console.error('Reset password error:', error);
    }
}

onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.endsWith('index.html')) {
        window.location.href = 'dashboard.html';
    }
});

loadLoginAttempts();
updateLoginAttemptsDisplay();