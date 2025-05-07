import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = {
  // Create a challenge
  createChallenge: async (challengeData: { title: string; description: string; category: string }) => {
    const res = await axios.post(`${API_URL}/adminChallenges`, challengeData);
    return res.data;
  },

  // Get all challenges
  getAllChallenges: async () => {
    const res = await axios.get(`${API_URL}/adminChallenges`);
    return res.data;
  },

  // Get a single challenge by ID
  getChallengeById: async (id: string) => {
    const res = await axios.get(`${API_URL}/adminChallenges/${id}`);
    return res.data;
  },

  // Update a challenge by ID
  updateChallenge: async (id: string, updatedData: { title?: string; description?: string; category?: string }) => {
    const res = await axios.put(`${API_URL}/adminChallenges/${id}`, updatedData);
    return res.data;
  },

  // Delete a challenge by ID
  deleteChallenge: async (id: string) => {
    const res = await axios.delete(`${API_URL}/adminChallenges/${id}`);
    return res.data;
  }
};

export default api;
