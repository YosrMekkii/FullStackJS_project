import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Calendar, Tag, Clock, Edit, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";

interface User {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
}

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

const SkillDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Obtenir l'ID de l'utilisateur actuel
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUserId(parsedUser.id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // Charger les détails de la compétence
    fetchSkillDetails();
  }, [id]);

  const fetchSkillDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/skill/skills/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch skill details");
      }
      const data = await response.json();
      setSkill(data);
    } catch (err) {
      setError("Failed to load skill details. Please try again later.");
      console.error("Error fetching skill:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async () => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        const response = await fetch(`http://localhost:3000/skill/skills/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          navigate('/marketplace');
        } else {
          throw new Error('Failed to delete skill');
        }
      } catch (err) {
        console.error('Error deleting skill:', err);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill details...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || "Skill not found"}</p>
          <button 
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = currentUserId === skill.user?._id;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Navigation */}
        <Link 
          to="/marketplace" 
          className="flex items-center text-indigo-600 mb-6 font-medium hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
        
        {/* Header with Image */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <img 
            src={skill.image || 'https://via.placeholder.com/1200x400?text=No+Image'} 
            alt={skill.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 md:p-8 w-full">
              <span className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-3">
                {skill.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{skill.title}</h1>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Skill Description */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <div className="prose max-w-none">
                {/* We display the description with proper formatting, preserving line breaks */}
                {skill.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            {isOwner ? (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => navigate(`/edit-skill/${skill._id}`)}
                  className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>Edit Skill</span>
                </button>
                <button
                  onClick={handleDeleteSkill}
                  className="flex-1 border-2 border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Skill</span>
                </button>
              </div>
            ) : (
              <Link
                to={`/user/${skill.user?._id}`}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 font-medium transition-colors w-full mb-6"
              >
                <UserPlus className="h-5 w-5" />
                <span>Connect with Instructor</span>
              </Link>
            )}
          </div>
          
          {/* Right Column - Information */}
          <div className="md:w-72">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Instructor</h3>
              <Link to={`/user/${skill.user?._id}`} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl mr-3">
                  {skill.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium">{skill.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">View Profile</p>
                </div>
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Information</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Posted on</p>
                    <p>{formatDate(skill.createdAt)}</p>
                  </div>
                </li>
                <li className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p>{formatDate(skill.updatedAt)}</p>
                  </div>
                </li>
                <li className="flex items-center text-gray-600">
                  <Tag className="h-5 w-5 mr-3 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{skill.category}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillDetails;