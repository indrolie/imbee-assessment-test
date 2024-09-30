const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
require('./rabbitmq-consumer');

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Start the server
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
