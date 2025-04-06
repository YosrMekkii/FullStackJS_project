import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
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


function App() {
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();
// Composant de protection de route
const ProtectedRoute = ({ user, children }: { user: any; children: JSX.Element }) => {
  return user ? children : <Navigate to="/login" />;
};

  // Vérification de l'utilisateur connecté au chargement de l'application
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erreur lors du parsing des données utilisateur :", error);
        localStorage.removeItem("user"); // Supprime les données corrompues
      }
    }
  }, []);

  // Fonction de logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");  // Redirige vers la page de login après la déconnexion
  };

  return (
    <div className="min-h-screen app-background">
      <nav className="bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">SkillShare Hub</span>
        </Link>
      </div>

      {/* Liens stylisés */}
      <div className="flex items-center space-x-6">
        <Link
          to="/marketplace"
          className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-300 hover:bg-indigo-500 hover:text-white"
        >
          Marketplace
        </Link>

        <Link
          to="/challenges"
          className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-300 hover:bg-indigo-500 hover:text-white"
        >
          Challenges
        </Link>

        <Link
          to="/about"
          className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-300 hover:bg-indigo-500 hover:text-white"
        >
          À propos
        </Link>
      </div>

      {/* Section Connexion / Profil */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/profile1" className="text-gray-700 font-medium">
              {user.firstName} {user.lastName}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-300 hover:bg-indigo-500 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium transition-all duration-300 hover:bg-indigo-600"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  </div>
</nav>

      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
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

            {/* Route protégée pour Challenges */}
  <Route path="/challenges" element={<ProtectedRoute user={user}><Challenges /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />



        </Routes>
        </div>
        
  );
  
}

export default App;
