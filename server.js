const dotenv = require('dotenv');

// Load env vars
const path = require('path');
dotenv.config({ path: './config/config.env' });

const express = require('express');
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Connect to database
const sequelize = require('./config/db'); 
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); 
  });

// Route files
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/users', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/posts', commentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1)); 
});
