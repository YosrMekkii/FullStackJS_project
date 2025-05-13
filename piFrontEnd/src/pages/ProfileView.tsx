import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './../components/Sidebar';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Book, 
  Award,
} from 'lucide-react';

const ProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    country: "",
    city: "",
    educationLevel: "",
    bio: "",
    profileImagePath: "",
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
    }
  });
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${id}`);
        setProfile(prev => ({
          ...prev,
          ...response.data,
          visibilitySettings: {
            ...prev.visibilitySettings,
            ...(response.data.visibilitySettings || {})
          }
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!id) return;
      setIsLoadingMatches(true);

      try {
        const response = await axios.get(`http://localhost:3000/api/matches/getmatchesfor/${id}`);
        const matchesData = Array.isArray(response.data)
          ? response.data
          : response.data.matches || [];

        const formattedMatches = matchesData.map(match => ({
          id: match._id || match.matchId,
          partner: {
            name: match.partner?.name || 
              (match.matchedUser 
                ? `${match.matchedUser.firstName} ${match.matchedUser.lastName}` 
                : "Unknown User"),
            avatar: match.partner?.avatar || 
              (match.matchedUser?.profileImagePath
                ? `http://localhost:3000${match.matchedUser.profileImagePath}`
                : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop")
          },
          skillShared: match.skillOffered || match.skillShared || "Not specified",
          skillLearned: match.skillRequested || match.skillLearned || "Not specified",
          status: match.status || "Active",
          startDate: new Date(match.createdAt || Date.now()).toISOString().split('T')[0]
        }));

        setMatches(formattedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [id]);

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
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start">
              <div className="flex space-x-6">
                <img
                  src={profile.profileImagePath ? `http://localhost:3000${profile.profileImagePath}` : '/default-avatar.png'}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {`${profile.firstName} ${profile.lastName}`}
                  </h1>
                  
                  <div className="space-y-2">
                    {profile.visibilitySettings.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-5 w-5 mr-2" />
                        {profile.email}
                      </div>
                    )}
                    
                    {profile.visibilitySettings.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        {`${profile.city}, ${profile.country}`}
                      </div>
                    )}
                    
                    {profile.visibilitySettings.age && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-2" />
                        {`${profile.age} years old`}
                      </div>
                    )}
                    
                    {profile.visibilitySettings.educationLevel && (
                      <div className="flex items-center text-gray-600">
                        <Book className="h-5 w-5 mr-2" />
                        {profile.educationLevel}
                      </div>
                    )}
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
              <p className="text-gray-600">{profile.bio}</p>
            </div>

            {/* Skills & Interests */}
            {(profile.visibilitySettings.skills || profile.visibilitySettings.interests) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Interests</h2>
                <div className="space-y-4">
                  {profile.visibilitySettings.skills && (
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
                  )}
                  
                  {profile.visibilitySettings.interests && (
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
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.visibilitySettings.achievements && (
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
            )}
          </div>

          {/* Right Column - Matches */}

        </div>
      </div>
    </div>
  );
};

export default ProfileView;