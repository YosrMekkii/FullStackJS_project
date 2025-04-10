import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, PlusCircle, Flag, Search, Filter, Star } from "lucide-react";
import WebDev from "../assets/webdev.jpeg";
import GraphicDesign from "../assets/6718fbb85d1152665bfafec4_Untitled design (14).jpg";
import DigitalMarketing from "../assets/Capa-do-Blog-Marketing-Digital.png";
import AI from "../assets/real-ai.jpg";
import French from "../assets/image.png";
import Marketing from "../assets/What-is-marketing.webp";
import Sidebar from "../components/sidebar";

const allSkills = [
  { 
    id: 1, 
    name: "Web Development", 
    provider: "Alice Johnson", 
    category: "Tech", 
    description: "Learn how to build full-stack web applications.",
    image: WebDev,
    rating: 4.8,
    reviews: 124,
    students: 1250,
    expertise: "Expert",
    languages: ["English", "Spanish"],
    topics: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database Design"],
    schedule: "Flexible",
    price: "50/hour"
  },
  { 
    id: 2, 
    name: "Graphic Design", 
    provider: "Michael Smith", 
    category: "Design", 
    description: "Master Photoshop, Illustrator, and Figma.",
    image: GraphicDesign,
    rating: 4.9,
    reviews: 89,
    students: 850,
    expertise: "Professional",
    languages: ["English"],
    topics: ["UI Design", "Brand Identity", "Typography", "Color Theory"],
    schedule: "Weekends",
    price: "45/hour"
  },
  { 
    id: 3, 
    name: "Digital Marketing", 
    provider: "Sophia Lee", 
    category: "Marketing", 
    description: "Learn SEO, social media marketing, and advertising.",
    image: DigitalMarketing,
    rating: 4.7,
    reviews: 156,
    students: 2100,
    expertise: "Expert",
    languages: ["English", "Mandarin"],
    topics: ["SEO", "Social Media", "Content Marketing", "Analytics"],
    schedule: "Flexible",
    price: "55/hour"
  },
  { 
    id: 4, 
    name: "AI & Machine Learning", 
    provider: "Daniel Brown", 
    category: "Tech", 
    description: "Dive into neural networks, Python, and AI applications.",
    image: AI,
    rating: 4.9,
    reviews: 78,
    students: 620,
    expertise: "Expert",
    languages: ["English"],
    topics: ["Python", "TensorFlow", "Neural Networks", "Computer Vision"],
    schedule: "Weekdays",
    price: "65/hour"
  },
  { 
    id: 5, 
    name: "Marketing", 
    provider: "Ding Lee", 
    category: "Marketing", 
    description: "Marketing, social media marketing, and advertising.",
    image: Marketing,
    rating: 4.6,
    reviews: 92,
    students: 940,
    expertise: "Professional",
    languages: ["English", "Chinese"],
    topics: ["Brand Strategy", "Market Research", "Campaign Planning"],
    schedule: "Flexible",
    price: "48/hour"
  },
  { 
    id: 6, 
    name: "French", 
    provider: "François Lacigalle", 
    category: "Language", 
    description: "Learn how to speak French fluently.",
    image: French,
    rating: 4.9,
    reviews: 203,
    students: 1580,
    expertise: "Native Speaker",
    languages: ["French", "English"],
    topics: ["Grammar", "Conversation", "Business French", "Culture"],
    schedule: "Flexible",
    price: "40/hour"
  }
];

const categories = ["All", "Tech", "Design", "Marketing", "Language"];

const SkillMarketplace = () => {
  const isAuthenticated = !!localStorage.getItem("user") || sessionStorage.getItem("user");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter skills based on category and search term
  const filteredSkills = allSkills.filter(skill => 
    (selectedCategory === "All" || skill.category === selectedCategory) &&
    (searchTerm === "" || skill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     skill.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">Skill Marketplace</h1>
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
              placeholder="Search skills, topics, or instructors..."
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
                key={skill.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px]"
              >
                <div className="relative">
                  <img src={skill.image} alt={skill.name} className="w-full h-48 object-cover" />
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
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{skill.name}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                  
                  <div className="flex items-center mb-3">
                    <div className="mr-2 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 font-medium">{skill.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({skill.reviews} reviews)</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-500 text-sm">{skill.students} students</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-medium text-gray-700">By {skill.provider}</p>
                    <span className="text-indigo-600 font-bold">${skill.price}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.topics.slice(0, 3).map((topic, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                    {skill.topics.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        +{skill.topics.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/skills/${skill.id}`}
                      className="flex-1 text-center py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={isAuthenticated ? `/connect/${skill.id}` : "/login"}
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