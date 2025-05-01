// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Enhanced debug version of getCurrentUserId
const getCurrentUserId = () => {
  try {
    console.log('Attempting to get user ID from localStorage');
    // Get from localStorage if you store it there
    const userString = localStorage.getItem('user');
    console.log('User string from localStorage:', userString);
    
    if (!userString) {
      console.log('No user found in localStorage');
      return null;
    }
    
    const user = JSON.parse(userString);
    console.log('Parsed user object:', user);
    
    const userId = user.id || user._id || user.userId;
    console.log('Extracted userId:', userId);
    
    return userId;
  } catch (error) {
    console.error('Error in getCurrentUserId:', error);
    return null;
  }
};

/**
 * Fetch user's completed challenges
 */
const fetchCompletedChallenges = async (userId = null) => {
  try {
    console.log('fetchCompletedChallenges called with userId:', userId);
    
    // Get userId if not provided
    const id = userId || getCurrentUserId();
    console.log('Using userId:', id);
    
    if (!id) {
      throw new Error('User ID is required');
    }
    
    // Try the new endpoint first
    try {
      const response = await axios.get(`${API_URL}/challenges/completed?userId=${id}`);
      return response.data;
    } catch (err) {
      // Fall back to the original endpoint
      const response = await axios.get(`${API_URL}/users/completed-challenges`);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    throw error;
  }
};

/**
 * Update user interests
 */
/**
 * Update user interests and fetch recommended challenges
 */
const updateUserInterests = async (userId, interests) => {
  try {
    console.log('updateUserInterests called with userId:', userId);
    console.log('interests:', interests);

    if (!userId) {
      throw new Error('User ID is required');
    }

    // First update the user's interests
    const response = await axios.put(`${API_URL}/users/${userId}/interests`, { interests });
    console.log('User interests updated successfully:', response.data);

    // Then fetch recommended challenges using the same userId
    const recommendedChallenges = await fetchRecommendedChallenges(userId);
    console.log('Recommended challenges fetched:', recommendedChallenges);

    return {
      success: true,
      updatedInterests: response.data,
      recommendedChallenges,
    };
  } catch (error) {
    console.error('Error updating user interests:', error);
    throw error;
  }
};

/**
 * Fetch all challenges, optionally filtered by category
 */
export const fetchChallenges = async (category = 'all') => {
  try {
    const response = await axios.get(`${API_URL}/challenges`);
    
    if (category !== 'all') {
      return response.data.filter(challenge => challenge.category === category);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

/**
 * Fetch personalized challenges for the user
 */
const fetchPersonalizedChallenges = async (userId = null) => {
  try {
    console.log('fetchPersonalizedChallenges called with userId:', userId);
    
    // Get userId if not provided
    const id = userId || getCurrentUserId();
    console.log('Using userId:', id);
    
    if (!id) {
      throw new Error('User ID is required');
    }
    
    const response = await axios.get(`${API_URL}/challenges/personalized?userId=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized challenges:', error);
    throw error;
  }
};

/**
 * Fetch daily challenges
 */
export const fetchDailyChallenges = async (userId = null) => {
  try {
    console.log('fetchDailyChallenges called with userId:', userId);
    
    // Get userId if not provided
    const id = userId || getCurrentUserId();
    console.log('Using userId:', id);
    
    // Try both endpoints (new first, then original)
    try {
      const response = await axios.get(`${API_URL}/challenges/dailychallenges${id ? `?userId=${id}` : ''}`);
      return response.data;
    } catch (err) {
      const response = await axios.get(`${API_URL}/challenges/daily`);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    throw error;
  }
};

/**
 * Mark a challenge as completed
 */
export const completeChallenge = async (challengeId, userId = null) => {
  try {
    console.log('completeChallenge called with challengeId:', challengeId, 'userId:', userId);
    
    // Get userId if not provided
    const id = userId || getCurrentUserId();
    console.log('Using userId:', id);
    
    // Try new endpoint format first
    try {
      const response = await axios.post(`${API_URL}/challenges/${challengeId}/complete${id ? `?userId=${id}` : ''}`);
      return response.data;
    } catch (err) {
      // Fall back to original format
      const response = await axios.post(`${API_URL}/challenges/complete/${challengeId}${id ? `?userId=${id}` : ''}`);
      return response.data;
    }
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error; 
  }
};

/**
 * Fetch user progress
 */
export const fetchUserProgress = async (userId = null) => {
  try {
    console.log('fetchUserProgress called with userId:', userId);
    
    // Get userId if not provided
    const id = userId || getCurrentUserId();
    console.log('Using userId:', id);
    
    if (!id) {
      throw new Error('User ID is required');
    }
    
    const response = await axios.get(`${API_URL}/challenges/progress?userId=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

/**
 * Fetch recommended challenges
 */
const fetchRecommendedChallenges = async (userId = null) => {
  try {
    console.log('fetchRecommendedChallenges called with userId:', userId);
    
    // Modified logic to be more defensive
    let id = userId;
    
    // Only try getCurrentUserId if no userId was provided
    if (!id) {
      console.log('No userId provided, attempting to get from localStorage');
      id = getCurrentUserId();
      console.log('ID from localStorage:', id);
    }
    
    // Final check
    if (!id) {
      console.log('No valid userId found');
      throw new Error('User ID is required');
    }
    
    console.log(`Making API request to ${API_URL}/challenges/recommended?userId=${id}`);
    const response = await axios.get(`${API_URL}/challenges/recommended?userId=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended challenges:', error);
    throw error;
  }
};

/**
 * Fetch a challenge by ID
 */
const fetchChallengeById = async (challengeId) => {
  try {
    const response = await axios.get(`${API_URL}/challenges/${challengeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching challenge by ID:', error);
    throw error;
  }
};

// Export all functions as default object
export default {
  fetchChallenges,
  fetchDailyChallenges,
  completeChallenge,
  fetchUserProgress,
  fetchCompletedChallenges,
  updateUserInterests,
  fetchPersonalizedChallenges,
  fetchRecommendedChallenges,
  fetchChallengeById,
  // Export for debugging
  getCurrentUserId
};