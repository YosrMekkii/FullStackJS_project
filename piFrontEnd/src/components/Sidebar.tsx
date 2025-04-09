import React, { useState } from 'react';
import { 
  Layout, 
 
  Speech,
  MessageCircleQuestion ,
  Settings,
 
  ShoppingBag,
  Trophy,
  UserCheck,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
     
      {/* Sidebar with transition */}
      <div 
        className={`bg-white border-r border-gray-200 fixed top-16 bottom-0 left-0 z-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Toggle button at bottom of sidebar */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg focus:outline-none text-indigo-600"
        >
          {isCollapsed ? 
            <ChevronRight className="h-4 w-4" /> : 
            <ChevronLeft className="h-4 w-4" />
          }
        </button>
        
        <nav className="mt-8 space-y-1 px-2">
          <a href="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <Layout className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Dashboard</span>}
          </a>
          <a href="/profile1" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <User className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Profile</span>}
          </a>
          <a href="/marketplace" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <ShoppingBag className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Marketplace</span>}
          </a>
          <a href="/challenges" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <Trophy className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Challenges</span>}
          </a>
          <a href="/matches" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <UserCheck className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Matching</span>}
          </a>
         
          <a href="/community" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
          <Speech  className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Community</span>}
          </a>
          <a href="/qa" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
          <MessageCircleQuestion  className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Q&A</span>}
          </a>
          <a href="#" className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg`}>
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Settings</span>}
          </a>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;