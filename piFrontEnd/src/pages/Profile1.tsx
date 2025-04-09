import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AIChat from './components/AIChat';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar'; // Import the Sidebar component
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Book, 
  Award, 
  Edit2, 
  Save,
  X,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Shield,
  AlertTriangle,
  Trash2,
  Camera,
  Upload,
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showGDPRInfo, setShowGDPRInfo] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    country: "",
    city: "",
    educationLevel: "",
    bio: "",
    profilePicture: "", // Added for storing base64 image
    skills: [],
    interests: [],
    achievements: [],
    visibilitySettings: {
      email: true,
      age: true,
      location: true,
      educationLevel: true,
      achievements: true,
      skills: true,
      interests: true,
      matches: true
    },
    profileImagePath: '',
  });
  const [user, setUser] = useState<any | null>(null);
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
  const userId = user ? user.id : null;
 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${userId}`);
        console.log("User Data:", response.data);
        setProfile(prev => ({
          ...prev,
          ...response.data,
          visibilitySettings: {
            ...prev.visibilitySettings,
            ...(response.data.visibilitySettings || {})
          }
        }));
        
        if (response.data.profilePicture) {
          setProfilePicture(response.data.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const matches = [
    {
      id: 1,
      partner: {
        name: "Jean Dupont",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      },
      skillShared: "JavaScript Programming",
      skillLearned: "French Language",
      status: "Active",
      startDate: "2024-02-15"
    },
    {
      id: 2,
      partner: {
        name: "Marie Laurent",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      },
      skillShared: "Web Development",
      skillLearned: "French Conversation",
      status: "Completed",
      startDate: "2024-01-10"
    }
  ];

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...profile,
        profilePicture: profilePicture
      };
      
      await axios.put(`http://localhost:3000/api/users/${userId}`, dataToSave);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select an image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePicture(base64String);
      // Also update in the profile state
      setProfile(prev => ({
        ...prev,
        profilePicture: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const toggleVisibility = () => {
    setShowConfirm(true);
  };

  const confirmToggleVisibility = async () => {
    try {
      const newVisibility = !isVisible;
      //await axios.put(`http://localhost:3000/api/users/${userId}/visibility`, {
        //isVisible: newVisibility
      //});
      setIsVisible(newVisibility);
      setShowConfirm(false);
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };
  
  const toggleFieldVisibility = async (field) => {
    try {
      const newSettings = {
        ...profile.visibilitySettings,
        [field]: !profile.visibilitySettings[field]
      };
      
     // await axios.put(`http://localhost:3000/api/users/${userId}/visibility-settings`, {
     // visibilitySettings: newSettings
     //});
  
      setProfile(prev => ({
        ...prev,
        visibilitySettings: newSettings
      }));
    } catch (error) {
      console.error("Error updating field visibility:", error);
    }
  };
  
  const handleDeleteProfile = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProfile = async () => {
    if (deleteConfirmText.toLowerCase() === 'delete my account') {
      try {
        await axios.delete(`http://localhost:3000/api/users/${userId}`);
        // Redirect to home page or login page after successful deletion
        window.location.href = '/';
      } catch (error) {
        console.error("Error deleting profile:", error);
      }
    }
  };

  if (!profile.firstName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* GDPR Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Data Privacy Controls</h2>
                <p className="text-sm text-gray-600">Manage your personal data and privacy settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDeleteProfile}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
              <button
                onClick={() => setShowGDPRInfo(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Privacy Info</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Status Banner */}
        <div className={`mb-4 p-4 rounded-lg ${isVisible ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isVisible ? (
                <Globe className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <Lock className="h-5 w-5 text-yellow-500 mr-2" />
              )}
              <span className={isVisible ? 'text-green-700' : 'text-yellow-700'}>
                Your profile is currently {isVisible ? 'visible to everyone' : 'hidden from other users'}
              </span>
            </div>
            <button
              onClick={toggleVisibility}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isVisible 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              {isVisible ? (
                <>
                  <Eye className="h-5 w-5" />
                  <span>Public Profile</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5" />
                  <span>Hidden Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div className="flex space-x-6">
                <img
                src={`http://localhost:3000${profile.profileImagePath}`}
                alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                />
                <div>
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        </div>
                      ) : (
                        `${profile.firstName} ${profile.lastName}`
                      )}
                    </h1>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                    {isEditing && (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                          <Save className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-gray-600 group">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          profile.email
                        )}
                      </div>
                      <button
                        onClick={() => toggleFieldVisibility('email')}
                        className={`ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          profile.visibilitySettings.email ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {profile.visibilitySettings.email ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 group">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={profile.city}
                              onChange={(e) => setProfile({...profile, city: e.target.value})}
                              className="border rounded px-2 py-1"
                              placeholder="City"
                            />
                            <input
                              type="text"
                              value={profile.country}
                              onChange={(e) => setProfile({...profile, country: e.target.value})}
                              className="border rounded px-2 py-1"
                              placeholder="Country"
                            />
                          </div>
                        ) : (
                          `${profile.city}, ${profile.country}`
                        )}
                      </div>
                      <button
                        onClick={() => toggleFieldVisibility('location')}
                        className={`ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          profile.visibilitySettings.location ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {profile.visibilitySettings.location ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 group">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.age}
                            onChange={(e) => setProfile({...profile, age: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          `${profile.age} years old`
                        )}
                      </div>
                      <button
                        onClick={() => toggleFieldVisibility('age')}
                        className={`ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          profile.visibilitySettings.age ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {profile.visibilitySettings.age ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-gray-600 group">
                      <div className="flex items-center">
                        <Book className="h-5 w-5 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.educationLevel}
                            onChange={(e) => setProfile({...profile, educationLevel: e.target.value})}
                            className="border rounded px-2 py-1"
                          />
                        ) : (
                          profile.educationLevel
                        )}
                      </div>
                      <button
                        onClick={() => toggleFieldVisibility('educationLevel')}
                        className={`ml-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                          profile.visibilitySettings.educationLevel ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {profile.visibilitySettings.educationLevel ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="text-center px-4 py-2 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-semibold text-indigo-600">24</p>
                  <p className="text-sm text-gray-600">Exchanges</p>
                </div>
                <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                  <p className="text-2xl font-semibold text-green-600">4.9</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About Me</h2>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full h-32 border rounded-lg p-2"
                />
              ) : (
                <p className="text-gray-600">{profile.bio}</p>
              )}
            </div>

            {/* Skills & Interests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Skills & Interests</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => toggleFieldVisibility('skills')}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
                      profile.visibilitySettings.skills
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Skills {profile.visibilitySettings.skills ? 'Visible' : 'Hidden'}</span>
                  </button>
                  <button
                    onClick={() => toggleFieldVisibility('interests')}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
                      profile.visibilitySettings.interests
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Interests {profile.visibilitySettings.interests ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Achievements</h2>
                <button
                  onClick={() => toggleFieldVisibility('achievements')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
                    profile.visibilitySettings.achievements
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>{profile.visibilitySettings.achievements ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
              <div className="space-y-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-600">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Matches */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Matches</h2>
                <button
                  onClick={() => toggleFieldVisibility('matches')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md ${
                    profile.visibilitySettings.matches
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>{profile.visibilitySettings.matches ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
              <div className="space-y-6">
                {matches.map((match) => (
                  <div key={match.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={match.partner.avatar}
                        alt={match.partner.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{match.partner.name}</h3>
                        <p className="text-xs text-gray-500">Started {match.startDate}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-600">Teaching:</span>{" "}
                        <span className="text-indigo-600">{match.skillShared}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Learning:</span>{" "}
                        <span className="text-indigo-600">{match.skillLearned}</span>
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      match.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Change Profile Visibility
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to {isVisible ? "hide" : "show"} your profile? 
                {isVisible 
                  ? " Other users won't be able to find or view your profile."
                  : " Your profile will be visible to all users."
                }
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={confirmToggleVisibility}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Yes, {isVisible ? "hide" : "show"} my profile
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center space-x-2 text-red-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Delete Account</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-medium">Warning: This action cannot be undone</p>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    <li>Your profile will be permanently deleted</li>
                    <li>All matches and connections will be removed</li>
                    <li>Your data will be erased from our systems</li>
                    <li>You'll lose access to all your learning progress</li>
                  </ul>
                </div>
                <p className="text-gray-600">
                  Please type "delete my account" to confirm deletion:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Type 'delete my account'"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={confirmDeleteProfile}
                    disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      deleteConfirmText.toLowerCase() === 'delete my account'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Delete Account
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GDPR Info Modal */}
        {showGDPRInfo && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Privacy Rights</h3>
                <button
                  onClick={() => setShowGDPRInfo(false)}
                  className="text-gray-400 hover text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-800 mb-2">Your Rights Under GDPR</h4>
                  <ul className="text-sm text-indigo-700 list-disc list-inside space-y-1">
                    <li>Right to access your personal data</li>
                    <li>Right to rectify inaccurate personal data</li>
                    <li>Right to erasure ("right to be forgotten")</li>
                    <li>Right to restrict processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How We Process Your Data</h4>
                  <p className="text-gray-600 text-sm">
                    We collect and process your data to provide our skill exchange services. This includes your profile information,
                    skills, interests, and interaction data. We only share your data with other users according to your visibility
                    settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
                  <p className="text-gray-600 text-sm">
                    We retain your data for as long as you maintain an active account. After account deletion, we may retain certain
                    data for legal compliance purposes for up to 30 days before permanent deletion.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Your Controls</h4>
                  <p className="text-gray-600 text-sm">
                    You can control your data through:
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Profile visibility settings</li>
                    <li>Field-level privacy controls</li>
                    <li>Account deletion</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowGDPRInfo(false)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;