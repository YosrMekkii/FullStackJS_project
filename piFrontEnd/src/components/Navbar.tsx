import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
  ChevronDown, 
  Briefcase, 
  PlusCircle, 
  Users, 
  Bell, 
  User, 
  LayoutDashboard, 
  LogOut,
  Search,
  Home
} from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const skillsDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Mock authentication state - replace with your actual auth logic
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target as Node)) {
        setIsSkillsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add shadow to navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Toggle authentication for demo purposes
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">SkillSwap</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:ml-10 space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              
              {/* Skills Dropdown */}
              <div className="relative" ref={skillsDropdownRef}>
                <button
                  onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    ['/marketplace', '/postskill'].includes(location.pathname)
                      ? 'text-indigo-600 border-b-2 border-indigo-600' 
                      : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  Skills
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isSkillsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSkillsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link
                        to="/marketplace"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        role="menuitem"
                      >
                        <Briefcase className="mr-3 h-5 w-5 text-gray-400" />
                        Skill Marketplace
                      </Link>
                      <Link
                        to="/postskill"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                        role="menuitem"
                      >
                        <PlusCircle className="mr-3 h-5 w-5 text-gray-400" />
                        Post a Skill
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link
                to="/matches"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/matching' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 mr-1" />
                Match
              </Link>
              
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location.pathname === '/dashboard' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Search bar - desktop only */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search skills..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/notifications"
                  className="relative p-1 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  <Bell className="h-6 w-6" />
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative ml-3" ref={profileDropdownRef}>
                  <div>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex text-sm rounded-full focus:outline-none"
                    >
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt="User profile"
                      />
                    </button>
                  </div>
                  
                  {isProfileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Link
                        to="/profile1"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <User className="mr-3 h-5 w-5 text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsAuthenticated(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </button>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/marketplace'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Skill Marketplace
          </Link>
          <Link
            to="/postskill"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/postskill'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Post a Skill
          </Link>
          <Link
            to="/matches"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/matching'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Match
          </Link>
          <Link
            to="/dashboard"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/dashboard'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/notifications"
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
              location.pathname === '/notifications'
                ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            Notifications
          </Link>
        </div>
        
        {/* Mobile search */}
        <div className="pt-2 pb-3 px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search skills..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* Mobile profile section */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {isAuthenticated ? (
            <>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">John Doe</div>
                  <div className="text-sm font-medium text-gray-500">john@example.com</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile1"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-1 px-2">
              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </button>
              <Link
                to="/signup"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 mt-3"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default  Navbar;
