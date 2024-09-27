const express = require('express');
const router = express.Router();

// Define a route
router.get('/', (req, res) => {
	res.send('Welcome to the ImBee Assessment Project!');
});

module.exports = router;