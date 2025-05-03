import axios from 'axios';

// Axios instance with direct port reference
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Challenge-related API calls
const fetchChallenges = async (category = 'all') => {
  try {
    const params = category !== 'all' ? { category } : {};
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

const fetchRecommendedChallenges = async (userId) => {
  try {
    const { data } = await API.get(`/challenges/recommended?userId=${userId}`);
    return data;
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

const completeChallenge = async (challengeId, userId) => {
  try {
    const { data } = await API.post('/challenges/complete', { challengeId, userId });
    return data;
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error;
  }
};

const fetchUserProgress = async (userId) => {
  try {
    const { data } = await API.get(`/users/${userId}/progress`);
    return data;
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

export default {
  fetchChallenges,
  fetchDailyChallenges,
  fetchRecommendedChallenges,
  fetchCompletedChallenges,
  completeChallenge,
  fetchUserProgress,
  updateUserInterests
};