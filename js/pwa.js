// PWA Registration and Installation Handler

(function() {
    'use strict';

    let deferredPrompt;
    let installButton;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        });
    }

    // Handle PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully');
        deferredPrompt = null;
        hideInstallButton();
        showInstalledNotification();
    });

    // Show install button
    function showInstallButton() {
        if (document.getElementById('pwa-install-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <div class="pwa-banner-icon">📱</div>
                <div class="pwa-banner-text">
                    <strong>Install App</strong>
                    <p>Add to home screen for offline access</p>
                </div>
                <button class="pwa-install-btn" id="pwa-install-btn">Install</button>
                <button class="pwa-close-btn" id="pwa-close-btn">&times;</button>
            </div>
        `;
        document.body.appendChild(banner);

        installButton = document.getElementById('pwa-install-btn');
        const closeButton = document.getElementById('pwa-close-btn');

        installButton.addEventListener('click', installPWA);
        closeButton.addEventListener('click', () => {
            banner.remove();
        });

        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    function hideInstallButton() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => banner.remove(), 300);
        }
    }

    async function installPWA() {
        if (!deferredPrompt) {
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        hideInstallButton();
    }

    function showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="pwa-notification-content">
                <span>🔄 New version available!</span>
                <button class="pwa-update-btn" id="pwa-update-btn">Update</button>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        document.getElementById('pwa-update-btn').addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
    }

    function showInstalledNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-success-notification';
        notification.innerHTML = `
            <div class="pwa-notification-content">
                <span>✅ App installed successfully!</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Check if running as PWA
    function isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    if (isPWA()) {
        console.log('✅ Running as PWA');
        document.body.classList.add('pwa-mode');
    }

})();
