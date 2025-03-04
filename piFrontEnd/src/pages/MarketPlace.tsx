import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, PlusCircle, Flag } from "lucide-react";
import WebDev from "../assets/webdev.jpeg";
import GraphicDesign from "../assets/6718fbb85d1152665bfafec4_Untitled design (14).jpg";
import DigitalMarketing from "../assets/Capa-do-Blog-Marketing-Digital.png";
import AI from "../assets/real-ai.jpg";
import French from "../assets/image.png";
import Marketing from "../assets/What-is-marketing.webp";

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filteredSkills = selectedCategory === "All" ? allSkills : allSkills.filter(skill => skill.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800 text-white py-10 px-6 flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full relative">
        {/* Filter Dropdown */}
        <div className="absolute top-0 left-0">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            className="bg-white text-gray-900 rounded-lg px-4 py-2 shadow-md focus:outline-none focus:ring focus:ring-indigo-300"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Title and Description */}
        <h1 className="text-5xl font-extrabold text-center mb-6">Skill Marketplace</h1>
        <p className="text-lg mb-10 max-w-2xl mx-auto text-center">
          Discover and connect with experts to enhance your skills and grow professionally.
        </p>

        {/* Post Skill Button */}
        <div className="text-center mb-6">
          <Link to="/postskill" className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center justify-center space-x-2 shadow-md w-fit mx-auto">
            <PlusCircle className="h-6 w-6" />
            <span>Post a Skill</span>
          </Link>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="bg-white text-gray-900 rounded-3xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
              <img src={skill.image} alt={skill.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-semibold mb-2">{skill.name}</h2>
                  <button 
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Report this skill"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-700 mb-4">{skill.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 font-medium">{skill.rating}</span>
                    <span className="text-gray-500 ml-1">({skill.reviews} reviews)</span>
                  </div>
                  <span className="text-indigo-600 font-medium">${skill.price}</span>
                </div>
                <p className="font-medium text-indigo-600">By {skill.provider}</p>
                <div className="mt-4 flex justify-between items-center">
                  <Link
                    to={`/skills/${skill.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/connect/${skill.id}`}
                    className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 flex items-center space-x-2 shadow-md"
                  >
                    <UserPlus className="h-6 w-6" />
                    <span>Connect</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillMarketplace;