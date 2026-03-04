const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/lostfound', require('./routes/lostFoundRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/techfeed', require('./routes/techPostRoutes'));
app.use('/api/polls', require('./routes/pollRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

app.use(errorHandler);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'CampusLink API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
