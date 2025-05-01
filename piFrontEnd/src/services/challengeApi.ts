import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = {
  // Set auth token for all requests
  setAuthToken: (token: string) => {
    axios.defaults.headers.common['x-auth-token'] = token;
  },

  // Auth endpoints
  login: async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    return res.data;
  },

  // User endpoints
  fetchUserProgress: async () => {
    const res = await axios.get(`${API_URL}/users/progress`);
    return res.data;
  },

  updateUserInterests: async (userId: string, interests: string[]) => {
    try {
      const res = await axios.put(`${API_URL}/users/${userId}/interests`, { interests });
      return res.data;
    } catch (error) {
      console.error('Error updating user interests:', error);
      throw error;
    }
  },

  fetchCompletedChallenges: async () => {
    const res = await axios.get(`${API_URL}/users/completed-challenges`);
    return res.data;
  },

  completeChallenge: async (challengeId: string) => {
    const res = await axios.post(`${API_URL}/users/complete-challenge/${challengeId}`);
    return res.data;
  },

  // Challenge endpoints
  fetchChallenges: async (category?: string) => {
    const params = category && category !== 'all' ? { category } : {};
    const res = await axios.get(`${API_URL}/challenges`, { params });
    return res.data;
  },

  fetchDailyChallenges: async () => {
    const res = await axios.get(`${API_URL}/challenges/daily`);
    return Array.isArray(res.data) ? res.data : [res.data]; // Ensure we always return an array
  },

  fetchChallenge: async (id: string) => {
    const res = await axios.get(`${API_URL}/challenges/${id}`);
    return res.data;
  },

  // Add createChallenge function
  createChallenge: async (challengeData: { title: string; description: string; category: string }) => {
    const res = await axios.post(`${API_URL}/challenges`, challengeData);
    return res.data;
  }
};


export default api;