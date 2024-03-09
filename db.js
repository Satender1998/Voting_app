const mongoose = require('mongoose');
require('dotenv').config();


// define the mongoDB connection URL
const mongoURL  = process.env.MONGODB_URL_LOCAL


// Set up MongoDB connection
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


// GET the default connection
// Mongoose maintains a default connection object representing the mongoDB connection.
const db = mongoose.connection;

// define event listeners for database connection

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (error) => {
    console.error('MongoDB connected error:', error);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});


// Export the database connection
module.exports = db;