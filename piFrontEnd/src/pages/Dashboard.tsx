import React from 'react';
import { 
  Layout, 
  Home, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Settings,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const skillExchanges = [
    {
      id: 1,
      offering: "JavaScript Programming",
      looking: "French Language",
      user: "Sarah Miller",
      location: "Paris, France",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      level: "Advanced"
    },
    {
      id: 2,
      offering: "Digital Marketing",
      looking: "Web Design",
      user: "John Cooper",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      level: "Intermediate"
    },
    {
      id: 3,
      offering: "Spanish Language",
      looking: "Photography",
      user: "Maria Garcia",
      location: "Barcelona, Spain",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      level: "Beginner"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-indigo-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-indigo-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 p-2 text-gray-400 hover:text-indigo-500"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200">
          <nav className="mt-8 space-y-1 px-4">
            <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <Home className="h-5 w-5 mr-3" />
              Overview
            </Link>
            <Link to="/dashboard" className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layout className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/dashboard/skills" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <BookOpen className="h-5 w-5 mr-3" />
              My Skills
            </Link>
            <Link to="/dashboard/connections" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <Users className="h-5 w-5 mr-3" />
              Connections
            </Link>
            <Link to="/dashboard/messages" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <MessageSquare className="h-5 w-5 mr-3" />
              Messages
            </Link>
            <Link to="/profile" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <User className="h-5 w-5 mr-3" />
              Profile
            </Link>
            <Link to="/dashboard/settings" className="flex items-center px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Active Exchanges</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">24</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">12</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Skills Shared</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">8</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Skill Exchange Proposals</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {skillExchanges.map((exchange) => (
                <div key={exchange.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <img
                      src={exchange.avatar}
                      alt={exchange.user}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{exchange.user}</h3>
                      <p className="text-sm text-gray-500">{exchange.location}</p>
                    </div>
                  </div>
                  <div className="flex-1 px-8">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Offering</p>
                        <p className="text-sm text-gray-500">{exchange.offering}</p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">Looking for</p>
                        <p className="text-sm text-gray-500">{exchange.looking}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {exchange.level}
                    </span>
                  </div>
                  <button className="ml-8 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;