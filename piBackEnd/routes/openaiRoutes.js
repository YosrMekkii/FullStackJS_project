import express from 'express';
import { OpenAI } from 'openai';  // Use OpenAI directly
import dotenv from 'dotenv';

dotenv.config(); // To load environment variables from .env file

const router = express.Router();


const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY, // add this to your .env
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000', // your project URL
    'X-Title': 'Skill Exchange App',         // project name
  },
});

// POST request to ask a question
router.post('/ask', async (req, res) => {
  const { question, history } = req.body;

  try {
    // Call OpenAI API with the user's question and message history
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',  // or gpt-3.5
      messages: [
        { role: 'system', content: 'You are an AI learning assistant helping a student...' },
        ...history,  // Include message history for context
        { role: 'user', content: question },  // The user's current question
      ],
    });

    // Get the AI's response
    const aiResponse = response.choices[0]?.message?.content || 'No response from AI.';
    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Backend AI error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
