import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, MessageCircle, Loader2, X, AlertTriangle, BookOpen } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  createdAt: string;
 // _id?: string; // Added to handle MongoDB ObjectId
}

interface MatchedUser {
  _id: string;
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  skills: string[];
  profileImagePath: string;
}

interface BatchUserResult {
  id: string;
  user: MatchedUser | null;
  exists: boolean;
}

const MatchesPage = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [invalidMatches, setInvalidMatches] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Failed to load user data");
      }
    } else {
      setError("Please log in to view matches");
    }
  }, []);

  // Fetch matches and matched users' data
  useEffect(() => {
    if (!userId) return;

    const fetchMatchesAndUsers = async () => {
      try {
        setLoading(true);
        
        // 1. Get all matches for current user
        const matchesResponse = await axios.get(`http://localhost:3000/api/matches/${userId}`);
        const userMatches = matchesResponse.data;
        console.log("Fetched matches for user", userId, ":", userMatches);
        
        // Transform MongoDB _id to id if needed
        const normalizedMatches = userMatches.map((match: any) => ({
          id: match.id || match._id,
          userId: match.userId,
          matchedUserId: match.matchedUserId,
          createdAt: match.createdAt,
          _id: match._id
        }));
        
        setMatches(normalizedMatches);
        
        if (normalizedMatches.length === 0) {
          console.log("No matches found for user", userId);
          setLoading(false);
          return;
        }
        
        // 2. Extract all matched user IDs
        const matchedUserIds = normalizedMatches.map(match => 
          match.userId === userId ? match.matchedUserId : match.userId
        );
        console.log("Matched user IDs to fetch:", matchedUserIds);
        
        try {
          const usersResponse = await axios.post('http://localhost:3000/api/users/batch', {
            ids: matchedUserIds
          });
          
          console.log("Batch API response data:", usersResponse.data);
          
          // Store debug info for troubleshooting
          setDebugInfo({
            matches: normalizedMatches,
            batchRequest: { ids: matchedUserIds },
            batchResponse: usersResponse.data
          });
          
          // Check the structure of the response
          if (!usersResponse.data || !Array.isArray(usersResponse.data.users)) {
            console.error("Unexpected API response structure:", usersResponse.data);
            setError("Invalid API response format");
            setLoading(false);
            return;
          }
          
          const batchResults = usersResponse.data.users;
          console.log("Batch results array:", batchResults);
          
          // Filter valid users (those with a non-null user property)
          const validUsers = batchResults
            .filter(result => result && result.user !== null)
            .map(result => result.user as MatchedUser);
          
          // Filter invalid user IDs (those marked as not existing)
          const invalidUserIds = batchResults
            .filter(result => result && result.exists === false)
            .map(result => result.id);
          
          console.log("Valid users after filtering:", validUsers);
          console.log("Invalid user IDs after filtering:", invalidUserIds);
          
          setMatchedUsers(validUsers);
          setInvalidMatches(invalidUserIds);
          
          console.log(`Found ${validUsers.length} valid matches and ${invalidUserIds.length} invalid matches`);
        } catch (error) {
          console.error("Error in batch API call:", error);
          setError("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error loading matches and users:", error);
        setError("Failed to load your matches. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchesAndUsers();
  }, [userId]);

  // Remove a match
  const removeMatch = async (matchId: string) => {
    if (!userId) return;

    try {
      // Call API to delete the match
      await axios.delete(`http://localhost:3000/api/matches/${matchId}`);
      
      // Find the match to get the matchedUserId
      const matchToRemove = matches.find(match => match.id === matchId || match._id === matchId);
      if (!matchToRemove) return;
      
      // Update state
      setMatches(matches.filter(match => match.id !== matchId && match._id !== matchId));
      setMatchedUsers(matchedUsers.filter(user => user.id !== matchToRemove.matchedUserId));
      
      console.log("Match removed successfully");
    } catch (error) {
      console.error("Error removing match:", error);
      setError("Failed to remove match");
    }
  };

  // Clean up all invalid matches
  const cleanupInvalidMatches = async () => {
    if (!userId || invalidMatches.length === 0) return;
    
    try {
      setLoading(true);
      
      // Find match IDs for invalid matched users
      const invalidMatchIds = matches
        .filter(match => invalidMatches.includes(match.matchedUserId))
        .map(match => match.id || match._id);
      
      // Delete each invalid match in parallel
      await Promise.all(
        invalidMatchIds.map(matchId => 
          axios.delete(`http://localhost:3000/api/matches/${matchId}`)
            .catch(err => console.error(`Error removing match ${matchId}:`, err))
        )
      );
      
      // Remove invalid matches from state
      setMatches(matches.filter(match => !invalidMatches.includes(match.matchedUserId)));
      setInvalidMatches([]);
      
      console.log("Invalid matches cleaned up successfully");
    } catch (error) {
      console.error("Error cleaning up invalid matches:", error);
      setError("Failed to clean up invalid matches");
    } finally {
      setLoading(false);
    }
  };

  // Debugging component for raw match data
  const MatchesDebugInfo = () => {
    const [expanded, setExpanded] = useState(false);
    
    if (!matches || matches.length === 0) return null;
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Raw Match Data</h3>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            {expanded ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {expanded && (
          <div className="mt-2 text-xs">
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(matches, null, 2)}
            </pre>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Found {matches.length} matches, but couldn't load user details
        </p>
      </div>
    );
  };

  // Function to reveal technical debug information
  const showDebugInfo = () => {
    console.log("Full debug information:", debugInfo);
    alert("Debug information logged to console");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-xl text-gray-600">Loading your matches...</p>
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
          <Link 
            to="/matches" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Skill Matching
          </Link>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-4">
              <button 
                onClick={showDebugInfo}
                className="text-xs text-gray-500 underline"
              >
                Show Debug Info
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50 py-8 px-4">
      <Sidebar />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              to="/matches"
              className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Matching</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
            
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <button 
                onClick={showDebugInfo}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600"
              >
                Debug Info
              </button>
            )}
          </div>
          
          {invalidMatches.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-700">
                    {invalidMatches.length} match{invalidMatches.length !== 1 ? 'es' : ''} could not be displayed because the user account{invalidMatches.length !== 1 ? 's' : ''} no longer exist{invalidMatches.length === 1 ? 's' : ''}.
                  </p>
                  <button 
                    onClick={cleanupInvalidMatches}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clean up invalid matches
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {matchedUsers.length === 0 && matches.length > 0 && (
            <MatchesDebugInfo />
          )}
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No matches yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't matched with anyone yet. Start swiping right to find skill matches!
            </p>
            <Link 
              to="/matches" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Find Matches
            </Link>
          </div>
        ) : matchedUsers.length === 0 && invalidMatches.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No valid matches</h2>
            <p className="text-gray-600 mb-6">
              All your matches refer to users that no longer exist. Please clean up invalid matches and try finding new connections.
            </p>
            <Link 
              to="/matches" 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Find Matches
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedUsers.map((user) => {
              // Find the corresponding match object to get the match ID
              const matchObj = matches.find(match => 
                match.matchedUserId === user.id || 
                (match.userId !== userId && match.userId === user.id)
              );
              const matchId = matchObj ? (matchObj.id || matchObj._id) : "";
              
              // Format the image path correctly
              const imagePath = user.profileImagePath?.replace(/\\/g, "/") || "";
              
              return (
                <div 
                  key={user.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 relative"
                >
                  {/* Make the entire card clickable except for the buttons */}
                  <Link to={`/profile/${user.id}`} className="block">
                    {/* Image section */}
                    <div 
                      className="h-48 bg-cover bg-center bg-gray-200"
                      style={{ backgroundImage: imagePath ? `url(${`http://localhost:3000${imagePath}`})` : 'none' }}
                    >
                      {!imagePath && (
                        <div className="h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content section */}
                    <div className="p-4">
                      {/* User name and location */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                          <p className="text-gray-600 text-sm">{user.location || "No location"}</p>
                        </div>
                      </div>
                      {/* Bio */}
                      <div className="mt-3">
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {user.bio || "No bio available"}
                        </p>
                      </div>
                      {/* Skills */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.slice(0, 3).map((skill, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs">No skills listed</span>
                          )}
                          {user.skills && user.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{user.skills.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="mt-6 flex justify-between">
                        <Link
                          to={`/studentInterface`} ///${user.id}
                          className="flex items-center text-green-600 hover:text-green-800"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering the parent Link
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span className="text-sm">Student Interface</span>
                        </Link>
                        <Link
                          to={`/messages/${user.id}`}
                          className="flex items-center text-indigo-600 hover:text-indigo-800"
                          onClick={(e) => e.stopPropagation()} // Prevent triggering the parent Link
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Message</span>
                        </Link>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Remove button outside the Link so it doesn't trigger navigation */}
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        removeMatch(matchId);
                      }}
                      className="p-1 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500"
                      title="Remove match"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;