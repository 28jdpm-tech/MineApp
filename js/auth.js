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

    // Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;
        
        loginError.style.display = 'none';
        const btn = document.getElementById('loginBtn');
        btn.textContent = 'Iniciando...';
        btn.disabled = true;

        window.auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Success, onAuthStateChanged will handle the UI
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
    });

    // Logout Click
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            StorageManager.clearAll();
            window.auth.signOut();
        });
    }
});


