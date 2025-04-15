import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  Check, 
  Info, 
  Star, 
  MapPin, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Image,
  Flag,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/sidebar';

interface SkillUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  location: string;
  bio: string;
  skills: string[];
  rating: number;
  experience: string;
  achievements: string[];
  profileImagePath: string;
}

interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  createdAt: string;
}

interface User {
  id: string;
  // other user properties
}

interface ReportFormData {
  reporter: string;
  reportedUser: string;
  reason: string;
  details: string;
  date: string;
}

const SkillMatching = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFormData, setReportFormData] = useState<ReportFormData>({
    reporter: '',
    reportedUser: '',
    reason: '',
    details: '',
    date: new Date().toISOString()
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setReportFormData(prev => ({
          ...prev,
          reporter: parsedUser._id
        }));
        console.log("Logged in user:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch users and matches once we have the current user
  useEffect(() => {
    if (!user || !user.id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await axios.get("http://localhost:3000/api/users");
        
        // Log all users to see what we're working with
        console.log("All users:", usersResponse.data);
        console.log("Current user ID:", user.id);
        
        // Filter out the current user by ID
        const filteredUsers = usersResponse.data.filter((u: SkillUser) => u.id !== user.id);
        console.log("Filtered users:", filteredUsers);
        
        // Fetch existing matches to potentially filter out users that are already matched
        const matchesResponse = await axios.get(`http://localhost:3000/api/matches/${user.id}`);
        const userMatches = matchesResponse.data;
        console.log("User matches:", userMatches);
        
        // Set the matches state
        setMatches(userMatches);
        
        // For now, just set all filtered users
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load potential matches");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:3000/api/reports', {
        ...reportFormData,
        reportedUser: users[currentIndex]._id,
        reporter: user?.id,
        date: new Date().toISOString()
      });
      
      alert('Report submitted successfully');
      setShowReportModal(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await axios.get("http://localhost:3000/api/users");
      
      console.log("All users:", usersResponse.data);
      console.log("Current user ID:", user.id);
      
      // Filter out the current user by ID - compare string versions of IDs
      const filteredUsers = usersResponse.data.filter((u: SkillUser) => {
        // Convert both to strings for reliable comparison
        return u._id?.toString() !== user.id?.toString();
      });
      
      console.log("Filtered users:", filteredUsers);
      
      // Map the users to ensure consistent ID handling
      const mappedUsers = filteredUsers.map((u: any) => ({
        ...u,
        // Use the MongoDB _id as the id property throughout
        id: u._id?.toString() || u.id
      }));
      
      // Fetch existing matches
      const matchesResponse = await axios.get(`http://localhost:3000/api/matches/${user.id}`);
      const userMatches = matchesResponse.data;
      console.log("User matches:", userMatches);
      
      setMatches(userMatches);
      setUsers(mappedUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load potential matches");
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [user]);
  
const saveMatch = async (matchedUserId: string) => {
  if (!user || !user.id) return null;
  
  try {
    const matchData = {
      userId: user.id,
      matchedUserId,
      createdAt: new Date().toISOString()
    };
    
    console.log("Saving match to database:", matchData);
    
    // Save match to database
    const response = await axios.post('http://localhost:3000/api/matches', matchData);
    console.log("Match saved to database:", response.data);
    
    // Check if it's a mutual match - ensure IDs are properly handled
    const mutualResponse = await axios.get(
      `http://localhost:3000/api/matches/mutual/${user.id}/${matchedUserId}`
    );
    
    const isMutual = mutualResponse.data.isMutual;
    console.log("Is mutual match:", isMutual);
    
    // Add to local matches state
    const savedMatch = response.data;
    setMatches(prev => [...prev, savedMatch]);
    
    return { ...savedMatch, isMutual };
  } catch (error) {
    console.error("Error saving match:", error);
    return null;
  }
};
  const handleSwipeLeft = async () => {
    if (currentIndex >= users.length) return;
    
    setSwipeDirection('left');
    
    try {
      console.log(`Swiped left on ${users[currentIndex].firstName}`);
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
        setOffsetX(0);
      }, 300);
    } catch (err) {
      console.error('Error recording swipe:', err);
    }
  };

  const handleSwipeRight = async () => {
    if (currentIndex >= users.length) return;
    
    setSwipeDirection('right');
    
    try {
      const matchedUser = users[currentIndex];
      console.log(`Swiped right on ${matchedUser.firstName}`);
      
      // Save match to database
      const savedMatch = await saveMatch(matchedUser.id);
      
      // Check if it's a mutual match
      const isMatch = savedMatch?.isMutual || false; 
      
      if (isMatch) {
        alert(`It's a match! You matched with ${matchedUser.firstName}`);
      }
      
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
        setOffsetX(0);
      }, 300);
    } catch (err) {
      console.error('Error recording swipe:', err);
    }
  };

  // Handle navigation to matches page with direct window.location
  const goToMatchesPage = () => {
    window.location.href = '/matchespage';
  };

  // Touch/mouse event handlers
  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    
    const newOffsetX = clientX - startX;
    setOffsetX(newOffsetX);
    
    if (cardRef.current) {
      const rotationAngle = newOffsetX * 0.1;
      cardRef.current.style.transform = `translateX(${newOffsetX}px) rotate(${rotationAngle}deg)`;
      
      if (newOffsetX > 0) {
        cardRef.current.style.boxShadow = `inset 0 0 0 2px #10b981, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`;
      } else if (newOffsetX < 0) {
        cardRef.current.style.boxShadow = `inset 0 0 0 2px #ef4444, 0 10px 15px -3px rgba(0, 0, 0, 0.1)`;
      } else {
        cardRef.current.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }
    }
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
      cardRef.current.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }
    
    const threshold = 100;
    
    if (offsetX > threshold) {
      handleSwipeRight();
    } else if (offsetX < -threshold) {
      handleSwipeLeft();
    } else {
      setOffsetX(0);
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0deg)';
      }
    }
    
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = '';
      }
    }, 300);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-xl text-gray-600">Finding potential matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
          <div className="text-red-500 mb-4">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No users available
  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-indigo-500 mb-4">
            <Info className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No users available</h2>
          <p className="text-gray-600 mb-6">
            There are no potential skill matches at the moment. Check back later for new users!
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/marketplace" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Skill Marketplace
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Refresh Matches
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No more users to show
  if (currentIndex >= users.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-indigo-500 mb-4">
            <Award className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You've seen everyone!</h2>
          <p className="text-gray-600 mb-6">
            There are no more potential skill matches at the moment. Check back later for new users!
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              to="/marketplace" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Skill Marketplace
            </Link>
            <Link 
              to="/matchespage" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
            >
              View My Matches ({matches.length})
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Refresh Matches
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];
  
  // Handle potential null profileImagePath safely
  const imagePath = currentUser && currentUser.profileImagePath 
    ? currentUser.profileImagePath.replace(/\\/g, "/") 
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 py-8 px-4">
      <Sidebar />
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Skill Matching</h1>
          <p className="text-gray-600 mt-2">Find people with skills you want to learn</p>
        </div>

        {/* Card Container */}
        <div className="relative h-[600px] w-full">
          {/* Current User Card */}
          <div
            ref={cardRef}
            className={`absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 ${
              swipeDirection === 'left' ? 'translate-x-[-150%] rotate-[-30deg]' : 
              swipeDirection === 'right' ? 'translate-x-[150%] rotate-[30deg]' : ''
            }`}
            style={{ 
              transform: isDragging ? `translateX(${offsetX}px) rotate(${offsetX * 0.1}deg)` : undefined,
              transition: isDragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Report Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReportModal(true);
              }}
              className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md text-red-500 hover:bg-red-50 transition-colors z-50"
            >
              <Flag className="h-5 w-5" />
            </button>

            {/* Card Content */}
            <div className="h-full flex flex-col">
              {/* User Image */}
              <div 
                className="relative h-[60%] bg-cover bg-center"
                style={{ 
                  backgroundImage: imagePath 
                    ? `url(http://localhost:3000${imagePath})` 
                    : 'none',
                  backgroundColor: !imagePath ? '#f3f4f6' : undefined
                }}
              >
                {/* Placeholder if no image */}
                {!imagePath && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Swipe Indicators */}
                {offsetX > 50 && (
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold transform -rotate-12 border-2 border-white">
                    MATCH
                  </div>
                )}
                {offsetX < -50 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold transform rotate-12 border-2 border-white">
                    PASS
                  </div>
                )}
                
                {/* User Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  <h2 className="text-2xl font-bold">{currentUser.firstName} {currentUser.lastName}</h2>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{currentUser.location || 'No location'}</span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 p-4 overflow-y-auto">
                {showDetails ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">About</h3>
                      <p className="text-gray-600 mt-1">{currentUser.bio || 'No bio available'}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{currentUser.rating || '0'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentUser.skills && currentUser.skills.length > 0 ? (
                          currentUser.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
                      <p className="text-gray-600 mt-1">{currentUser.experience || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                      {currentUser.achievements && currentUser.achievements.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {currentUser.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <Award className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 mt-1">No achievements listed</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentUser.skills && currentUser.skills.length > 0 ? (
                          currentUser.skills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">About</h3>
                      <p className="text-gray-600 mt-1 line-clamp-3">{currentUser.bio || 'No bio available'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle Details Button */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50"
              >
                <Info className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8">
          <button
            onClick={handleSwipeLeft}
            className="p-4 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          <button
            onClick={handleSwipeRight}
            className="p-4 bg-white text-green-500 rounded-full shadow-md hover:bg-green-50 transition-colors"
          >
            <Check className="h-8 w-8" />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            to="/marketplace"
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Marketplace</span>
          </Link>
          
          <Link
            to="/matchespage"
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <span>My Matches ({matches.length})</span>
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    Report User
                  </h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleReport} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Report
                    </label>
                    <select
                      required
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      value={reportFormData.reason}
                      onChange={(e) => setReportFormData({
                        ...reportFormData,
                        reason: e.target.value
                      })}
                    >
                      <option value="">Select a reason</option>
                      <option value="inappropriate_behavior">Inappropriate Behavior</option>
                      <option value="fake_profile">Fake Profile</option>
                      <option value="spam">Spam</option>
                      <option value="harassment">Harassment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details
                    </label>
                    <textarea
                      required
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={4}
                      placeholder="Please provide specific details about the issue..."
                      value={reportFormData.details}
                      onChange={(e) => setReportFormData({
                        ...reportFormData,
                        details: e.target.value
                      })}
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMatching;