import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserPlus, PlusCircle, Flag, Search, Star } from "lucide-react";
import Sidebar from "../components/sidebar";

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  user: {
    _id: string;
    name: string;
  };
}

const categories = ["All", "Tech", "Design", "Marketing", "Language"];

const SkillMarketplace = () => {
  const isAuthenticated = !!localStorage.getItem("user") || sessionStorage.getItem("user");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('http://localhost:3000/skill/skills');
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      const data = await response.json();
      setSkills(data);
    } catch (err) {
      setError('Failed to load skills. Please try again later.');
      console.error('Error fetching skills:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter skills based on category and search term
  const filteredSkills = skills.filter(skill => 
    (selectedCategory === "All" || skill.category === selectedCategory) &&
    (searchTerm === "" || 
     skill.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchSkills}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
            Skill Marketplace
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto text-center mb-8">
            Discover and connect with experts to enhance your skills and grow professionally.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search skills or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Post Skill Button */}
          <Link 
            to="/postskill" 
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 shadow-md transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Post a Skill</span>
          </Link>
        </div>
        
        {/* Results Count */}
        <p className="text-gray-600 mb-6">
          Showing {filteredSkills.length} {filteredSkills.length === 1 ? 'result' : 'results'}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
          {searchTerm && ` for "${searchTerm}"`}
        </p>
        
        {/* Skills Grid */}
        {filteredSkills.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div 
                key={skill._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
              >
                <div className="relative">
                  <img 
                    src={skill.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={skill.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <button 
                      className="p-2 bg-white/80 rounded-full hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                      title="Report this skill"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-white text-sm font-medium px-3 py-1 bg-indigo-600 rounded-full">
                      {skill.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{skill.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-medium text-gray-700">
                      By {skill.user?.name || 'Anonymous'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/skills/${skill._id}`}
                      className="flex-1 text-center py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={isAuthenticated ? `/connect/${skill._id}` : "/login"}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Connect</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No skills found</h3>
            <p className="text-gray-500">Try changing your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMarketplace;