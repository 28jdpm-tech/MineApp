document.addEventListener('DOMContentLoaded', () => {
    const mapAuthError = (code) => {
    switch (code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
        case 'auth/wrong-password':
            return 'Correo o contraseña incorrectos. Verifica que el usuario exista.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Por favor, intenta de nuevo más tarde.';
        case 'auth/email-already-in-use':
            return 'El correo electrónico ya está registrado en otra cuenta.';
        case 'auth/weak-password':
            return 'La contraseña es muy débil (mínimo 6 caracteres).';
        case 'auth/network-request-failed':
            return 'Error de conexión a internet.';
        default:
            return 'Ocurrió un error: ' + code;
    }
};
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
    const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
    const loginConfirmPassword = document.getElementById('loginConfirmPassword');
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
                    alert('Error: ' + mapAuthError(error.code));
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
                if(authSubtitle) authSubtitle.textContent = 'Inicia sesión para acceder a tu sistema';
                btn.textContent = 'Ingresar';
                authToggleLink.innerHTML = '&iquest;No tienes cuenta? Reg&iacute;strate aqu&iacute;';
                if (forgotPasswordLink && forgotPasswordLink.parentElement) forgotPasswordLink.parentElement.style.display = 'block';
                if (confirmPasswordGroup) confirmPasswordGroup.style.display = 'none';
                if (loginConfirmPassword) loginConfirmPassword.value = '';
            } else {
                authTitle.textContent = 'Crear Nueva Cuenta';
                if(authSubtitle) authSubtitle.textContent = 'Crea una cuenta para empezar a usar el sistema';
                btn.textContent = 'Registrarse';
                authToggleLink.innerHTML = '&iquest;Ya tienes cuenta? Inicia Sesi&oacute;n';
                if (forgotPasswordLink && forgotPasswordLink.parentElement) forgotPasswordLink.parentElement.style.display = 'none';
                if (confirmPasswordGroup) confirmPasswordGroup.style.display = 'block';
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

                if (!isLoginMode) {
            const confirmPass = loginConfirmPassword ? loginConfirmPassword.value : '';
            if (password !== confirmPass) {
                loginError.textContent = 'Las contrase\u00f1as no coinciden.';
                loginError.style.display = 'block';
                btn.textContent = 'Registrarse';
                btn.disabled = false;
                return;
            }
        }
        if (isLoginMode) {
            window.auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    btn.textContent = 'Ingresar';
                    btn.disabled = false;
                    loginForm.reset();
                })
                .catch((error) => {
                    loginError.textContent = mapAuthError(error.code);
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
                    loginError.textContent = mapAuthError(error.code);
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









