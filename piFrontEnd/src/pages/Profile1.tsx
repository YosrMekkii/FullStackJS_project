import React, { useState } from 'react';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Book, 
  Award, 
  Edit2, 
  Save,
  X
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Sarah",
    lastName: "Miller",
    email: "sarah.miller@example.com",
    age: "28",
    country: "France",
    city: "Paris",
    education: "Master's Degree",
    bio: "Passionate about teaching JavaScript and learning French. I believe in the power of knowledge exchange and continuous learning.",
    skills: ["JavaScript", "React", "Node.js", "Web Development"],
    interests: ["French Language", "Cultural Exchange", "Teaching"],
    achievements: [
      "Helped 20+ students learn JavaScript",
      "Completed Advanced French Course",
      "5-star rating as a mentor"
    ]
  });

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

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the changes to your backend
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div className="flex space-x-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
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
                    <div className="flex items-center text-gray-600">
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
                    <div className="flex items-center text-gray-600">
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
                    <div className="flex items-center text-gray-600">
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
                    <div className="flex items-center text-gray-600">
                      <Book className="h-5 w-5 mr-2" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.education}
                          onChange={(e) => setProfile({...profile, education: e.target.value})}
                          className="border rounded px-2 py-1"
                        />
                      ) : (
                        profile.education
                      )}
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Interests</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Matches</h2>
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
      </div>
    </div>
  );
};

export default Profile;