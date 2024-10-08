const express = require('express');
const router = express.Router();
const { saveTokenToDatabase, getAllTokens } = require('../sequelize');
const { publishMessage } = require('../rabbitmq-consumer');
const { v4: uuidv4 } = require('uuid');

// Define a route
router.get('/', (req, res) => {
	res.send('Welcome to the ImBee Assessment Project!');
});

router.post('/subscribe', async(req, res) => {
	try {
		const { token } = req.body;
		await saveTokenToDatabase(token);
	
		res.status(200).json({ message: 'Token saved successfully' });
	} catch (error) {
		console.error('Error saving token:', error);
		res.status(500).json({ message: 'Error saving token' });
	}
});

router.post('/broadcast', async(req, res) => {
	try {
		const { message } = req.body;
		const uniqueIdentifier = () => `fcm-msg-${uuidv4().substring(0, 10)}`;
		const tokens = await getAllTokens();
		console.log('All Firebase Tokens: ', JSON.stringify(tokens))

        await Promise.all(
            tokens.map(token => {
				const messageContent = {
					identifier: uniqueIdentifier(),
					type: "device",
					deviceId: token,
					text: message
				};

                publishMessage(messageContent)
            })
        );

        res.status(200).json({ success: true, message: 'Messages sent to all devices!' });
    } catch (error) {
		console.error('Error in broadcasting:', error);
		res.status(500).json({ message: 'Error in broadcasting' });
	}
});

module.exports = router;