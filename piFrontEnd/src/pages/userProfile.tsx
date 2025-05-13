import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Book, 
  Award,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  age?: string;
  country?: string;
  city?: string;
  educationLevel?: string;
  bio?: string;
  profilePicture?: string;
  profileImagePath?: string;
  skills?: string[];
  interests?: string[];
  achievements?: string[];
  visibilitySettings?: {
    email: boolean;
    age: boolean;
    location: boolean;
    educationLevel: boolean;
    achievements: boolean;
    skills: boolean;
    interests: boolean;
  };
}


const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  //const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current logged in user ID
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUserId(parsedUser.id);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    // Fetch user profile and skills
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
  
    setLoading(true);
    try {
      // Fetch user profile only
      const profileResponse = await axios.get(`http://localhost:3000/api/users/${userId}`);
      setProfile(profileResponse.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /*const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };*/

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || "User not found"}</p>
          <Link 
            to="/marketplace"
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUserId === userId;
  
  // Function to get the display name initial
  const getInitial = () => {
    if (profile.firstName) return profile.firstName.charAt(0);
    return '?';
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
              <div className="flex-shrink-0">
                {profile.profilePicture || profile.profileImagePath ? (
                  <img 
                    src={profile.profilePicture || `http://localhost:3000${profile.profileImagePath}`}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl">
                    {getInitial()}
                  </div>
                )}
              </div>
              <div className="mt-4 md:mt-0 md:ml-6 md:mb-2 flex-grow">
                <h1 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.visibilitySettings?.location !== false && (profile.city || profile.country) && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
              
              {/* Connect Button - Only show to other users */}
              {!isOwnProfile && (
                <div className="mt-4 md:mt-0">
                  <Link 
                    to={`/messages/${userId}`} 
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <div className="mt-4">
                <h2 className="font-semibold text-lg mb-2">About</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Info */}
          <div className="md:w-1/3">
            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4">Personal Information</h2>
              <ul className="space-y-3">
                {profile.visibilitySettings?.email !== false && profile.email && (
                  <li className="flex items-center">
                    <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                    <span>{profile.email}</span>
                  </li>
                )}
                
                {profile.visibilitySettings?.educationLevel !== false && profile.educationLevel && (
                  <li className="flex items-center">
                    <Book className="h-5 w-5 text-indigo-600 mr-3" />
                    <span>{profile.educationLevel}</span>
                  </li>
                )}
                
                {profile.visibilitySettings?.age !== false && profile.age && (
                  <li className="flex items-center">
                    <Calendar className="h-5 w-5 text-indigo-600 mr-3" />
                    <span>{profile.age} years old</span>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Skills */}
            {profile.visibilitySettings?.skills !== false && profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Interests */}
            {profile.visibilitySettings?.interests !== false && profile.interests && profile.interests.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-lg mb-4">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Achievements */}
            {profile.visibilitySettings?.achievements !== false && profile.achievements && profile.achievements.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg mb-4">Achievements</h2>
                <ul className="space-y-3">
                  {profile.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-center">
                      <Award className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Right Column - Skills */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">
                Skills Offered by {profile.firstName}
              </h2>
              {/* LENNA - Skills */}
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;