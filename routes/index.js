const express = require('express');
const router = express.Router();
const { saveTokenToDatabase } = require('../sequelize');

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

module.exports = router;