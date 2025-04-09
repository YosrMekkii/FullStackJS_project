import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, MessageCircle, Loader2, X } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/sidebar';

interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  createdAt: string;
}

interface MatchedUser {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  skills: string[];
  profileImagePath: string;
}

const MatchesPage = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
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

  // Fetch matches from database
  useEffect(() => {
    if (!userId) return;

    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Get matches for current user from API
        const response = await axios.get(`http://localhost:3000/api/matches/${userId}`);
        setMatches(response.data);
        console.log("User matches from database:", response.data);
      } catch (error) {
        console.error("Error loading matches:", error);
        setError("Failed to load matches data");
      }
    };

    fetchMatches();
  }, [userId]);

  // Fetch matched users' details
  useEffect(() => {
    if (!matches.length) {
      setLoading(false);
      return;
    }

    const fetchMatchedUsers = async () => {
      try {
        // Extract matched user IDs
        const matchedUserIds = matches.map(match => match.matchedUserId);
        
        if (matchedUserIds.length === 0) {
          setLoading(false);
          return;
        }
        
        // Get user details for all matched users
        // This could be optimized with a specific endpoint that accepts an array of IDs
        const matchedUsersData = await Promise.all(
          matchedUserIds.map(async (id) => {
            try {
              const response = await axios.get(`http://localhost:3000/api/users/${id}`);
              return response.data;
            } catch (err) {
              console.error(`Error fetching user ${id}:`, err);
              return null;
            }
          })
        );
        
        // Filter out any failed requests
        const validUsers = matchedUsersData.filter(user => user !== null);
        setMatchedUsers(validUsers);
      } catch (error) {
        console.error("Error fetching matched users:", error);
        setError("Failed to load matched users' details");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedUsers();
  }, [matches]);

  // Remove a match
  const removeMatch = async (matchId: string) => {
    if (!userId) return;

    try {
      // Call API to delete the match
      await axios.delete(`http://localhost:3000/api/matches/${matchId}`);
      
      // Find the match to get the matchedUserId
      const matchToRemove = matches.find(match => match.id === matchId);
      if (!matchToRemove) return;
      
      // Update state
      setMatches(matches.filter(match => match.id !== matchId));
      setMatchedUsers(matchedUsers.filter(user => user.id !== matchToRemove.matchedUserId));
      
      console.log("Match removed successfully");
    } catch (error) {
      console.error("Error removing match:", error);
      setError("Failed to remove match");
    }
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
          </div>
        </div>

        {matchedUsers.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedUsers.map((user) => {
              // Find the corresponding match object to get the match ID
              const matchObj = matches.find(match => match.matchedUserId === user.id);
              const matchId = matchObj ? matchObj.id : "";
              
              return (
                <div 
                  key={user.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105"
                >
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${`http://localhost:3000/${user.profileImagePath}`})` }}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h3>
                        <p className="text-gray-600 text-sm">{user.location}</p>
                      </div>
                      <button 
                        onClick={() => removeMatch(matchId)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Remove match"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-gray-700">Skills:</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {user.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            +{user.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mt-3 text-sm line-clamp-2">{user.bio}</p>
                    
                    <div className="mt-4">
                      <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </button>
                    </div>
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