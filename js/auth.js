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
            
            // Reload the configuration and initialize cloud sync for this specific tenant
            const config = StorageManager.getConfig();
            Object.assign(FOODX_DATA, config);
            if (typeof renderPosCart === 'function') {
                try {
                    StorageManager.initCloudSync(
                        () => { 
                            if (typeof renderCheckoutPage === 'function') renderCheckoutPage();
                            if (typeof renderOrdersPage === 'function') renderOrdersPage();
                            if (typeof renderExpensesList === 'function') renderExpensesList();
                        },
                        () => { 
                            if (typeof renderPosProducts === 'function') renderPosProducts();
                            if (typeof renderPosCart === 'function') renderPosCart();
                        },
                        (order) => { 
                            if(typeof showNotification === 'function') showNotification('Pedido sincronizado'); 
                        }
                    );
                } catch(e) {}
            }
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
            window.auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert('Correo de recuperaci\u00f3n enviado a ' + email + '. Por favor revisa tu bandeja de entrada o spam.');
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
                authTitle.textContent = 'Bienvenido a MineApp';
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






