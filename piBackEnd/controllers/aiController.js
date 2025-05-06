import { suggestProposalsForUser } from '../services/aiService.js';
import { OpenAI } from 'openai';  // Use OpenAI directly
import axios from 'axios';


const getRecommendations = async (userInput) => {
  const response = await axios.get(`http://localhost:5000/recommendations/${userInput}`);
  console.log(response.data);
};


export const getSuggestions = async (req, res) => {
  try {
    const user = req.user; // supposons que l'utilisateur est authentifié
    const suggestions = await suggestProposalsForUser(user);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
