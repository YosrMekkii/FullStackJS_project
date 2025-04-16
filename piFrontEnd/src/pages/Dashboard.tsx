import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // Import the Sidebar component

const Dashboard = () => {
  const [sidebarState, setSidebarState] = useState(false);
  const [mainContentMargin, setMainContentMargin] = useState('ml-64');

  // Listen for sidebar state changes through a custom event
  useEffect(() => {
    const handleSidebarChange = (event) => {
      setSidebarState(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarChange);
    
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange);
    };
  }, []);

  // Update main content margin when sidebar state changes
  useEffect(() => {
    setMainContentMargin(sidebarState ? 'ml-16' : 'ml-64');
  }, [sidebarState]);

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
      {/* Include the Sidebar component */}
      <Sidebar />

      {/* Main Content - with dynamic margin based on sidebar state */}
      <div className={`${mainContentMargin} p-8 transition-all duration-300 ease-in-out`}>
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
  );
};

export default Dashboard;