const admin = require('firebase-admin');
require('dotenv').config();

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // prevent newline issues
	})
});

const sendNotification = (deviceId, messageText) => {
	const message = {
		notification: {
			title: 'Incoming message',
			body: messageText,
			image: '/imbee-logo.png'
		},
		token: deviceId,
	};

	return admin.messaging().send(message);
};

module.exports = { sendNotification };