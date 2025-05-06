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

// Challenge-related API calls
const fetchChallenges = async (category = 'all', userId) => {
  try {
    // Include userId as a parameter to filter out completed challenges
    const params = { 
      ...(category !== 'all' && { category }),
      userId // Send userId to backend to filter out completed challenges
    };
    const { data } = await API.get('/challenges', { params });
    return data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
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

const fetchRecommendedChallenges = async (userId, userInterests = []) => {
  try {
    // Include interests in the request to avoid another database lookup
    const interestsParam = userInterests.length > 0 
      ? `&interests=${encodeURIComponent(JSON.stringify(userInterests))}` 
      : '';
    
    const { data } = await API.get(`/challenges/recommended?userId=${userId}${interestsParam}`);
    
    // Show recommendation reason in UI if available
    const enhancedResults = data.map(challenge => {
      return {
        ...challenge,
        // Format display text based on recommendation reason
        recommendationText: challenge.recommendationReason 
          ? `${challenge.recommendationReason}` 
          : null
      };
    });
    
    return enhancedResults;
  } catch (error) {
    console.error('Error fetching recommended challenges:', error);
    throw error;
  }
};

const fetchCompletedChallenges = async (userId) => {
  try {
    const { data } = await API.get(`/challenges/completed?userId=${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    throw error;
  }
};

// Complete a challenge and update xp, streak, and daily goals
const completeChallenge = async (challengeId, userId) => {
  try {
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
      includeUserUpdate: true // Flag to indicate user document should be updated with new level and stats
    });
    
    // After completing a challenge, update the user in localStorage with the new level and stats
    if (data && data.level) {
      updateUserInStorage(data);
    }
    
    return data;
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error;
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

const updateUserInterests = async (userId, interests) => {
  try {
    const { data } = await API.put(`/users/${userId}/interests`, { interests });
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

export default {
  setAuthToken,
  fetchChallenges,
  fetchDailyChallenges,
  fetchRecommendedChallenges,
  fetchCompletedChallenges,
  completeChallenge,
  fetchUserProgress,
  updateUserInterests
};