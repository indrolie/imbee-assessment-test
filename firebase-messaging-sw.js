importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

try {
    firebase.initializeApp({
        apiKey: process.env.FIREBASE_CLIENT_APIKEY,
        authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
        storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_CLIENT_APP_ID
    });

    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
        console.log('Received background message: ', payload);
        
        const notificationTitle = payload.notification.title || 'Background Message';
        const notificationOptions = {
            body: payload.notification.body || 'You have a new message!',
            icon: '/imbee-logo.png'
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
} catch (error) {
    console.log('[Firebase-messaging-sw Error] ', error)
}