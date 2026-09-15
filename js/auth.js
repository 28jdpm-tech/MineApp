document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('loginOverlay');
    const loginForm = document.getElementById('loginForm');
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const appContainer = document.querySelector('.app-container');

    // Hide app container initially until auth is verified
    if(appContainer) {
        appContainer.style.display = 'none';
    }

    // Auth State Listener
    window.auth.onAuthStateChanged((user) => {
        if (user) {
                        // User is signed in
            loginOverlay.style.display = 'none';
            if(appContainer) appContainer.style.display = 'flex';
            
            // MULTI-TENANT: Set the global tenant ID to the user's UID
            window.currentUserTenant = user.uid;
            
            // Reload the configuration for this specific tenant
            const config = StorageManager.getConfig();
            Object.assign(FOODX_DATA, config);
        } else {
            // User is signed out
            loginOverlay.style.display = 'flex';
            if(appContainer) appContainer.style.display = 'none';
        }
    });

        
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();
            if (!email) {
                alert('Por favor, ingresa tu correo electr\u00f3nico en el campo de arriba para enviarte el enlace de recuperaci\u00f3n.');
                return;
            }
            window.auth.languageCode = 'es';
            window.auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('\u00a1Correo enviado a ' + email + '!\n\n1. Revisa tu bandeja (o Spam) y haz clic en el enlace para crear tu nueva contrase\u00f1a.\n2. Luego, regresa a esta pantalla e inicia sesi\u00f3n normalmente.');
                    document.getElementById('loginPassword').value = '';
                })
                .catch((error) => {
                    alert('Error al recuperar contrase\u00f1a: ' + error.message);
                });
        });
    }

    const authToggleLink = document.getElementById('authToggleLink');
    const btn = document.getElementById('loginBtn');
    let isLoginMode = true;

    if (authToggleLink) {
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            if (isLoginMode) {
                authTitle.textContent = 'Bienvenido a Minesof';
                btn.textContent = 'Ingresar';
                authToggleLink.innerHTML = '&iquest;No tienes cuenta? Reg&iacute;strate aqu&iacute;';
            } else {
                authTitle.textContent = 'Crear Nueva Cuenta';
                btn.textContent = 'Registrarse';
                authToggleLink.innerHTML = '&iquest;Ya tienes cuenta? Inicia Sesi&oacute;n';
            }
        });
    }

    // Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        loginError.style.display = 'none';
        btn.textContent = 'Procesando...';
        btn.disabled = true;

        if (isLoginMode) {
            window.auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    btn.textContent = 'Ingresar';
                    btn.disabled = false;
                    loginForm.reset();
                })
                .catch((error) => {
                    loginError.textContent = 'Error: ' + error.message;
                    loginError.style.display = 'block';
                    btn.textContent = 'Ingresar';
                    btn.disabled = false;
                });
        } else {
            window.auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    btn.textContent = 'Registrarse';
                    btn.disabled = false;
                    loginForm.reset();
                })
                .catch((error) => {
                    loginError.textContent = 'Error: ' + error.message;
                    loginError.style.display = 'block';
                    btn.textContent = 'Registrarse';
                    btn.disabled = false;
                });
        }
    });

    // Logout Click
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            StorageManager.clearAll();
            window.auth.signOut();
        });
    }
});









