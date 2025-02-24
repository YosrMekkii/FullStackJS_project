import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
// import ProfilePage from './pages/Profile';
import Profile from './pages/Profile1';
import SkillMarketplace from './pages/MarketPlace';
import PostSkill from './pages/PostSkill';
import '../src/css/App.css'
import Interests from './pages/interests';
import ReCAPTCHA from "react-google-recaptcha";
import AdminDashboard from './pages/AdminDashboard';
import LearningSession from './pages/LearningSession';
const user = {
  name: 'John Doe',
  profilePicture: 'https://via.placeholder.com/150', // Use a valid image URL
  bio: 'A passionate learner and developer.',
  achievements: [
    'Completed 100+ projects',
    'Mentored 20+ students',
    'Won a hackathon'
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'AI']
};

function App() {
  return (
    <Router>
      <div className="min-h-screen app-background">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <span className="text-xl font-bold text-gray-900">SkillShare Hub</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md">
                  Login
                </Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
        <Route path="/profile1" element={<Profile />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/profile" element={<ProfilePage user={user} />} /> Pass the user object as a prop */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<SkillMarketplace />} />
          <Route path="/postskill" element={<PostSkill />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path='/learningsession' element={<LearningSession />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
