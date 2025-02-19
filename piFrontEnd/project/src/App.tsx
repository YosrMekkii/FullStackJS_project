import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Only show the main nav on non-dashboard pages */}
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <>
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
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;