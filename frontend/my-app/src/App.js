import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Announcements from './pages/Announcements';
import Complaints from './pages/Complaints';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LostAndFound from './pages/LostAndFound';
import Register from './pages/Register';
import Timetable from './pages/Timetable';
// Skill Exchange Marketplace pages
import MySessions from './pages/MySessions';
import Profile from './pages/Profile';
import ReviewForm from './pages/ReviewForm';
import SessionBooking from './pages/SessionBooking';
import SkillForm from './pages/SkillForm';
import SkillMarketplace from './pages/SkillMarketplace';
import TechFeed from './pages/TechFeed';
import TechFeedAdmin from './pages/TechFeedAdmin';
// Polls pages
import AIAssistant from './pages/AIAssistant';
import AdminAnalytics from './pages/AdminAnalytics';
import LandingPage from './pages/LandingPage';
import Leaderboard from './pages/Leaderboard';
import Polls from './pages/Polls';
import PollsAdmin from './pages/PollsAdmin';

function ProtectedRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Sidebar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/lostandfound" element={<ProtectedRoute><LostAndFound /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Skill Exchange Marketplace routes */}
            <Route path="/skills" element={<ProtectedRoute><SkillMarketplace /></ProtectedRoute>} />
            <Route path="/skills/new" element={<ProtectedRoute><SkillForm /></ProtectedRoute>} />
            <Route path="/sessions/book/:skillId" element={<ProtectedRoute><SessionBooking /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><MySessions /></ProtectedRoute>} />
            <Route path="/reviews/new/:sessionId" element={<ProtectedRoute><ReviewForm /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Tech Feed routes */}
            <Route path="/techfeed" element={<ProtectedRoute><TechFeed /></ProtectedRoute>} />
            <Route path="/techfeed/admin" element={<ProtectedRoute><TechFeedAdmin /></ProtectedRoute>} />
            
            {/* Polls routes */}
            <Route path="/polls" element={<ProtectedRoute><Polls /></ProtectedRoute>} />
            <Route path="/polls/admin" element={<ProtectedRoute><PollsAdmin /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;