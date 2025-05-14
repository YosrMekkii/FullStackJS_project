import axios from 'axios';

// Create an Axios instance with consistent baseURL
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface ChallengeProgress {
  challengeId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  progress: {
    completed: boolean;
    progress: number;
    startedAt: string | null;
    completedAt: string | null;
  };
  xp: number;              
  streak: number;          
  dailyGoals: number;      
}

interface UserProgressResponse {
  success: boolean;
  progress: ChallengeProgress[];
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
}

interface UserRankResponse {
  success: boolean;
  rank: number;
  totalUsers: number;
}

export const updateChallengeProgress = async (
  userId: string,
  challengeId: string,
  data: {
    progress?: number;
    completed?: boolean;
  }
) => {
  try {
    const response = await API.put(
      `/users/${userId}/progress/${challengeId}`,
      data
    );
    
    return response.data;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
};

// Set auth token for all requests
const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

const fetchChallenges = async (category = 'all', userId) => {
  try {
    // Update our local cache of completed challenges first
    await updateCompletedChallengesCache(userId);
    
    // Get unique challenge IDs of completed challenges
    const completedIds = new Set(completedChallengesCache.map(c => c._id));
    
    console.log(`Filtering out ${completedIds.size} completed challenges`);
    
    // Include userId as a parameter to filter out completed challenges
    const params = { 
      ...(category !== 'all' && { category }),
      userId, // Send userId to backend to filter out completed challenges
      completedChallengeIds: Array.from(completedIds) // Send list of completed IDs as array
    };
    
    const { data } = await API.get('/challenges', { params });
    
    // Additional client-side filtering to ensure completed challenges don't appear
    if (data && data.data) {
      // Filter out completed challenges
      const filteredChallenges = data.data.filter(challenge => !completedIds.has(challenge._id));
      
      console.log(`Filtered ${data.data.length - filteredChallenges.length} challenges client-side`);
      data.data = filteredChallenges;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};
/**
 * Fetches multiple challenges by their IDs
 * @param {string[]} challengeIds - Array of challenge IDs to fetch
 * @param {string} userId - User ID to check completion status
 * @returns {Promise<Array>} - Array of challenge objects
 */
const fetchChallengesByIds = async (challengeIds, userId) => {
  try {
    if (!challengeIds || !Array.isArray(challengeIds) || challengeIds.length === 0) {
      throw new Error('Valid challenge IDs array is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data } = await API.post('/challenges/batch', {
      challengeIds,
      userId
    });

    console.log("DEBUG: Raw response from /challenges/batch =", data);

    return data.data; // ✅ return only the array of challenges
  } catch (error) {
    console.error('Error fetching challenges by IDs:', error);
    throw error;
  }
};


const fetchChallengeById = async (challengeId, userId) => {
  try {
    if (!challengeId) {
      throw new Error('Challenge ID is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Make request to the API endpoint with userId as query parameter
    const { data } = await API.get(`/challenges/${challengeId}`, {
      params: { userId }
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching challenge by ID:', error);
    throw error;
  }
};

const fetchDailyChallenges = async (userId) => {
  try {
    const { data } = await API.get(`/challenges/daily?userId=${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    throw error;
  }
};

const fetchCompletedChallenges = async (userId, forceRefresh = false) => {
  try {
    // Use cache if available and not forcing refresh
    if (!forceRefresh && completedChallengesCache.length > 0) {
      return { success: true, data: completedChallengesCache };
    }
    
    const { data } = await API.get(`/challenges/completed?userId=${userId}`);
    
    // Update cache with fresh data, but don't deduplicate here - let updateCompletedChallengesCache handle that
    if (data && data.data) {
      console.log('Fetched completed challenges:', data.data);
      
      // For the returned data, deduplicate immediately to prevent React key warnings
      if (Array.isArray(data.data)) {
        // Create an object to track the most recent completion of each challenge
        const uniqueChallenges = {};
        
        // Sort by completedAt date (newest first)
        const sortedChallenges = [...data.data].sort((a, b) => {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        });
        
        // Keep only the most recent completion of each challenge
        for (const challenge of sortedChallenges) {
          if (!uniqueChallenges[challenge._id]) {
            uniqueChallenges[challenge._id] = challenge;
          }
        }
        
        // Convert back to array
        data.data = Object.values(uniqueChallenges);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    throw error;
  }
};

const completeChallenge = async (challengeId, userId) => {
  try {
    // First check if this challenge is already in our completed challenges cache
    // This helps prevent duplicate completions on the client side
    const isAlreadyCompleted = completedChallengesCache.some(
      challenge => challenge._id === challengeId && challenge.completed
    );
    
    if (isAlreadyCompleted) {
      console.log(`Challenge ${challengeId} is already completed - skipping completion request`);
      return { success: true, alreadyCompleted: true };
    }
    
    // Assuming xp is awarded based on the challenge
    const xpEarned = 50; // Example xp value for completing a challenge
    const streakIncrease = 1; // Assuming streak is incremented by 1
    const dailyGoalCompleted = 1; // Assuming one daily goal is completed per challenge

    const { data } = await API.post('/challenges/complete', { 
      challengeId, 
      userId,
      completedAt: new Date().toISOString(), // Add timestamp for streak calculation
      xp: xpEarned,
      streak: streakIncrease,
      dailyGoals: dailyGoalCompleted,
      includeUserUpdate: true, // Flag to indicate user document should be updated with new level and stats
      saveProgress: true  // Flag to indicate streak and daily goals should be saved
    });
    
    // After completing a challenge, update the user in localStorage with all stats
    if (data) {
      updateUserInStorage(data);
      
      // Fix 2: Force update the local cache of completed challenges
      // This will ensure the UI reflects the newly completed challenge immediately
      await updateCompletedChallengesCache(userId);
      
      // Add the new completed challenge to our cache immediately so UI updates
      // This should be deduplicated during the next cache update
      if (!isAlreadyCompleted) {
        const completedChallenge = {
          _id: challengeId,
          completedAt: new Date().toISOString(),
          completed: true
        };
        
        // Only add if not already in the cache
        if (!completedChallengesCache.some(c => c._id === challengeId)) {
          completedChallengesCache.push(completedChallenge);
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error;
  }
};

// Fix 3: Add cache management for completed challenges
// This helps prevent reload issues by properly maintaining the completed challenges list
let completedChallengesCache = [];


// Fix 4: Implement function to update the completed challenges cache with deduplication
const updateCompletedChallengesCache = async (userId) => {
  try {
    const result = await fetchCompletedChallenges(userId);
    if (result && result.data) {
      // Create a Map to deduplicate by challenge ID, keeping only the most recent completion
      const challengeMap = new Map();
      
      // Sort by completedAt date in descending order (newest first)
      const sortedChallenges = [...result.data].sort((a, b) => {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      });
      
      // Keep only the most recent completion of each challenge
      for (const challenge of sortedChallenges) {
        if (!challengeMap.has(challenge._id)) {
          challengeMap.set(challenge._id, challenge);
        }
      }
      
      // Convert Map back to array
      completedChallengesCache = Array.from(challengeMap.values());
      
      console.log(`Deduplicated ${sortedChallenges.length} entries to ${completedChallengesCache.length} unique challenges`);
    }
    return completedChallengesCache;
  } catch (error) {
    console.error('Error updating completed challenges cache:', error);
    return completedChallengesCache;
  }
};


export const fetchUserProgress = async (userId: string): Promise<ChallengeProgress[]> => {
  try {
    const response = await API.get<UserProgressResponse>(
      `/users/${userId}/progress`
    );
    
    if (response.data.success) {
      return response.data.progress.map(progress => ({
        ...progress,
        xp: progress.xp || 0,
        streak: progress.streak || 0,
        dailyGoals: progress.dailyGoals || 0
      }));
    } else {
      throw new Error('Failed to fetch user progress');
    }
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

const updateUserInterests = async (userId, newInterests) => {
  try {
    // First, get the current interests
    const { data: currentUser } = await API.get(`/users/${userId}`);
    const currentInterests = currentUser.interests || [];
    
    // Combine current interests with new ones, avoiding duplicates
    const updatedInterests = [...new Set([...currentInterests, ...newInterests])];
    
    // Send the updated interests to the API
    const { data } = await API.put(`/users/${userId}/interests`, { interests: updatedInterests });
    return data;
  } catch (error) {
    console.error('Error updating user interests:', error);
    throw error;
  }
};

// Helper function to update user in localStorage
const updateUserInStorage = (data) => {
  try {
    // Get current user from storage
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      // Update user with new level
      parsedUser.level = data.level;
      
      // Save back to the same storage medium
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(parsedUser));
      } else if (sessionStorage.getItem("user")) {
        sessionStorage.setItem("user", JSON.stringify(parsedUser));
      }
      
      console.log("Updated user in storage with level:", data.level);
    }
  } catch (error) {
    console.error("Error updating user in storage:", error);
  }
};

// Leaderboard API calls
const fetchLeaderboard = async (limit = 10): Promise<LeaderboardUser[]> => {
  try {
    const response = await API.get(`/users/leaderboard?limit=${limit}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

const fetchGlobalLeaderboard = async (limit = 10, page = 1): Promise<LeaderboardResponse> => {
  try {
    const response = await API.get(`/leaderboard/global`, {
      params: { limit, page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

const fetchFriendLeaderboard = async (userId: string): Promise<LeaderboardUser[]> => {
  try {
    const response = await API.get(`/leaderboard/friends/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching friend leaderboard:', error);
    throw error;
  }
};

const fetchUserRank = async (userId: string): Promise<UserRankResponse> => {
  try {
    const response = await API.get(`/leaderboard/rank/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    throw error;
  }
};

export default {
  fetchUserRank,
  setAuthToken,
  fetchChallenges,
  fetchDailyChallenges,
  fetchCompletedChallenges,
  completeChallenge,
  fetchUserProgress,
  updateUserInterests,
  fetchLeaderboard,
  updateChallengeProgress,
  fetchFriendLeaderboard,
  fetchGlobalLeaderboard,
  fetchChallengeById,
  fetchChallengesByIds
};