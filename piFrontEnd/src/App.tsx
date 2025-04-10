import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, ChevronDown, Bell, User } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile1';
import SkillMarketplace from './pages/MarketPlace';
import PostSkill from './pages/PostSkill';
import Interests from './pages/interests';
import SkillDetails from './pages/SkillDetails';
import AdminDashboard from './pages/AdminDashboard';
import LearningSession from './pages/LearningSession';
import Challenges from './pages/Challenges';
import About from './pages/About';
import SkillMatching from './pages/SkillMatching';
import StudentInterface from './pages/studentLearningInterface';
import { Navigate } from "react-router-dom";
import Community from './pages/community';
import QA from './pages/questionsanswers';
import QuestionDetail from './pages/Questiondetail';
import AskQuestion from './pages/askquestion';
import MatchesPage from './pages/MatchesPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const ProtectedRoute = ({ user, children }: { user: any; children: JSX.Element }) => {
    return user ? children : <Navigate to="/login" />;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
      <nav className="bg-blue-900 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105"
              >
                <GraduationCap className="h-8 w-8 text-white group-hover:text-blue-300 transition-colors" />
                <span className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  SkillShare Hub
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/marketplace"
                className="px-4 py-2 rounded-lg text-blue-100 font-medium transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                Marketplace
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-4 py-2 rounded-lg text-blue-100 font-medium transition-all duration-300 hover:bg-white/10 hover:text-white flex items-center"
                >
                  Explore
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-blue-900 rounded-lg shadow-lg py-2 border border-white/20">
                    <Link
                      to="/challenges"
                      className="block px-4 py-2 text-blue-100 hover:bg-white/10 transition-colors"
                    >
                      Challenges
                    </Link>
                    <Link
                      to="/community"
                      className="block px-4 py-2 text-blue-100 hover:bg-white/10 transition-colors"
                    >
                      Community
                    </Link>
                    <Link
                      to="/qa"
                      className="block px-4 py-2 text-blue-100 hover:bg-white/10 transition-colors"
                    >
                      Q&A
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                className="px-4 py-2 rounded-lg text-blue-100 font-medium transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                About
              </Link>
            </div>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <button className="p-2 text-blue-100 hover:bg-white/10 rounded-lg transition-all duration-300">
                    <Bell className="h-5 w-5" />
                  </button>
                  <Link to={user?.role === 'admin' ? '/admindashboard' : '/profile1'} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-blue-100 font-medium transition-all duration-300 hover:bg-white/10">
                  <User className="h-5 w-5" />
                  <span>{user.firstName} {user.lastName}</span>
                  </Link>
                  {/* Admin Role Label */}
      {user?.role === 'admin' && (
        <span className="absolute right-0 text-sm text-red-500 font-semibold">
          Admin
        </span>
      )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-500/80 text-white font-medium transition-all duration-300 hover:bg-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-blue-100 font-medium transition-all duration-300 hover:bg-white/10 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 rounded-lg bg-white text-indigo-600 font-medium transition-all duration-300 hover:bg-blue-50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-blue-100 hover:bg-white/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-900 border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/marketplace"
                className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
              >
                Marketplace
              </Link>
              <Link
                to="/challenges"
                className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
              >
                Challenges
              </Link>
              <Link
                to="/community"
                className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
              >
                Community
              </Link>
              <Link
                to="/qa"
                className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
              >
                Q&A
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
              >
                About
              </Link>
              {user ? (
                <>
                  <Link
                    to={user?.role === 'admin' ? '/admindashboard' : '/profile1'} 
                    className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-lg text-red-300 font-medium hover:bg-white/10 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-lg text-blue-100 font-medium hover:bg-white/10 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 rounded-lg bg-white text-indigo-600 font-medium transition-all duration-300 hover:bg-blue-50"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile1" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/marketplace" element={<SkillMarketplace />} />
        <Route path="/postskill" element={<PostSkill />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/skills/:id" element={<SkillDetails />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path='/learningsession' element={<LearningSession />} />
        <Route path="/matches" element={<SkillMatching />} />
        <Route path="/studentInterface" element={<StudentInterface />} />
        <Route path="/community" element={<Community />} />
        <Route path="/qa" element={<QA />} />
        <Route path="/qa/:id" element={<QuestionDetail />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/about" element={<About />} />
        <Route path="/matchesPage" element={<MatchesPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App;