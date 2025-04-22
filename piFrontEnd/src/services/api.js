// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Add token to requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Challenge API calls
export const fetchChallenges = async (category = 'all') => {
  const response = await axios.get(`${API_URL}/challenges`);
  
  if (category !== 'all') {
    return response.data.filter(challenge => challenge.category === category);
  }
  
  return response.data;
};

export const fetchDailyChallenges = async () => {
  const response = await axios.get(`${API_URL}/challenges/daily`);
  return response.data;
};

export const completeChallenge = async (challengeId) => {
  const response = await axios.post(`${API_URL}/challenges/complete/${challengeId}`);
  return response.data;
};

export const fetchUserProgress = async () => {
  const response = await axios.get(`${API_URL}/challenges/progress`);
  return response.data;
};

export default {
  setAuthToken,
  fetchChallenges,
  fetchDailyChallenges,
  completeChallenge,
  fetchUserProgress
};