import express from 'express';
import Challenge from '../models/challenge.js';
import User from '../models/user.js';

const router = express.Router();

/**
 * Get all challenges
 */
const getAllChallenges = async (req, res) => {
  try {
    const filter = {};
    
    // Handle any query params for filtering
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.dailyChallenge === 'true') {
      filter.dailyChallenge = true;
    }

    const challenges = await Challenge.find(filter).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get all challenges (admin view)
 */
const getAllChallengesAdmin = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get challenge by ID
 */
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Create a new challenge
 */
const createChallenge = async (req, res) => {
  try {
    const { title, description, type, difficulty, xp, timeLimit, category, tags, content, dailyChallenge } = req.body;
    
    // Create new challenge
    const newChallenge = new Challenge({
      title,
      description,
      type,
      difficulty,
      xp: xp || 100, // Default XP
      timeLimit,
      category,
      tags: tags || [],
      content,
      dailyChallenge: dailyChallenge || false,
    });
    
    const challenge = await newChallenge.save();
    res.status(201).json(challenge);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

/**
 * Update a challenge
 */
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    // Update fields
    const {
      title,
      description,
      type,
      difficulty,
      xp,
      timeLimit,
      category,
      tags,
      content,
      dailyChallenge
    } = req.body;

    if (title) challenge.title = title;
    if (description) challenge.description = description;
    if (type) challenge.type = type;
    if (difficulty) challenge.difficulty = difficulty;
    if (xp) challenge.xp = xp;
    if (timeLimit) challenge.timeLimit = timeLimit;
    if (category) challenge.category = category;
    if (tags) challenge.tags = tags;
    if (content) challenge.content = content;
    if (dailyChallenge !== undefined) challenge.dailyChallenge = dailyChallenge;

    await challenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Delete a challenge
 */
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }

    await challenge.deleteOne(); // Using deleteOne() instead of remove() which is deprecated
    res.json({ msg: 'Challenge removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    res.status(500).send('Server Error');
  }
};

/**
 * Get daily challenge
 */
const getDailyChallenge = async (req, res) => {
  try {
    const dailyChallenge = await Challenge.findOne({ dailyChallenge: true });
    
    if (!dailyChallenge) {
      return res.status(404).json({ msg: 'No daily challenge found' });
    }

    res.json(dailyChallenge);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get personalized challenges based on user ID from query parameter
 */
const getPersonalizedChallenges = async (req, res) => {
  try {
    // Get userId from query parameter instead of auth middleware
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required as a query parameter' });
    }
    
    // Get the user's profile with interests and level
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate user's level (or get it from the user object)
    const userLevel = user.level || 1; // Default to level 1 if not set
    
    // Map user level to challenge difficulty
    let difficulties = [];
    if (userLevel <= 5) {
      difficulties = ['beginner'];
    } else if (userLevel <= 10) {
      difficulties = ['beginner', 'intermediate'];
    } else {
      difficulties = ['beginner', 'intermediate', 'advanced'];
    }
    
    // Get user's interests
    const userInterests = user.interests || [];
    
    // Base query to find appropriate challenges
    let query = {
      difficulty: { $in: difficulties }
    };
    
    // Find challenges
    let challenges = await Challenge.find(query);
    
    // Score and sort the challenges based on user interests
    const scoredChallenges = challenges.map(challenge => {
      // Calculate how many tags match user interests
      const matchingTags = challenge.tags.filter(tag => 
        userInterests.includes(tag)
      );
      
      // Calculate relevance score (percentage of matching tags)
      // Add small base score to avoid zero scores
      const relevanceScore = userInterests.length > 0 ? 
        (matchingTags.length / userInterests.length) + 0.1 : 
        0.1;
      
      // Return challenge with score
      return {
        ...challenge.toObject(),
        relevanceScore
      };
    });
    
    // Sort by relevance score (highest first)
    scoredChallenges.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Get user's completed challenges
    const completedChallengeIds = user.completedChallenges && user.completedChallenges.length > 0 ?
      user.completedChallenges.map(
        completedChallenge => completedChallenge.challengeId.toString()
      ) : [];
    
    // Mark challenges as completed
    const personalizedChallenges = scoredChallenges.map(challenge => ({
      ...challenge,
      completed: completedChallengeIds.includes(challenge._id.toString())
    }));
    
    return res.status(200).json(personalizedChallenges);
    
  } catch (error) {
    console.error('Error getting personalized challenges:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get daily challenges for a specific user ID
 */
const getDailyChallenges = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required as a query parameter' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's level
    const userLevel = user.level || 1;
    
    // Map user level to challenge difficulty
    let difficulties = [];
    if (userLevel <= 5) {
      difficulties = ['beginner'];
    } else if (userLevel <= 10) {
      difficulties = ['beginner', 'intermediate'];
    } else {
      difficulties = ['beginner', 'intermediate', 'advanced'];
    }
    
    // Find daily challenges matching user's level
    const dailyChallenges = await Challenge.find({
      dailyChallenge: true,
      difficulty: { $in: difficulties }
    });
    
    // Get user's completed challenges today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedTodayIds = user.completedChallenges && user.completedChallenges.length > 0 ?
      user.completedChallenges
        .filter(challenge => {
          const completedDate = new Date(challenge.completedAt);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        })
        .map(challenge => challenge.challengeId.toString())
      : [];
    
    // Mark challenges as completed
    const personalizedDailyChallenges = dailyChallenges.map(challenge => ({
      ...challenge.toObject(),
      completed: completedTodayIds.includes(challenge._id.toString())
    }));
    
    return res.status(200).json(personalizedDailyChallenges);
    
  } catch (error) {
    console.error('Error getting daily challenges:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get recommended challenges for a specific user ID
 */
const getRecommendedChallenges = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required as a query parameter' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate user level
    const userLevel = user.level || 1;
    
    // Map user level to challenge difficulty
    let difficulties = [];
    if (userLevel <= 5) {
      difficulties = ['beginner'];
    } else if (userLevel <= 10) {
      difficulties = ['beginner', 'intermediate'];
    } else {
      difficulties = ['beginner', 'intermediate', 'advanced'];
    }
    
    // Get user interests
    const userInterests = user.interests || [];
    
    // Get challenges matching user's difficulty level
    const challenges = await Challenge.find({
      difficulty: { $in: difficulties }
    });
    
    // Score challenges based on user interests
    const scoredChallenges = challenges.map(challenge => {
      const matchingTags = challenge.tags.filter(tag => 
        userInterests.includes(tag)
      );
      
      const relevanceScore = userInterests.length > 0 ? 
        (matchingTags.length / userInterests.length) + 0.1 : 
        0.1;
      
      return {
        ...challenge.toObject(),
        relevanceScore
      };
    });
    
    // Sort by relevance score (highest first)
    scoredChallenges.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Get top 5 recommended challenges
    const recommendedChallenges = scoredChallenges.slice(0, 5);
    
    return res.status(200).json(recommendedChallenges);
    
  } catch (error) {
    console.error('Error getting recommended challenges:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get completed challenges for a specific user ID
 */
const getCompletedChallenges = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required as a query parameter' });
    }
    
    const user = await User.findById(userId)
      .populate('completedChallenges.challengeId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if completedChallenges exists
    if (!user.completedChallenges || user.completedChallenges.length === 0) {
      return res.status(200).json([]);
    }
    
    // Format the completed challenges
    const completedChallenges = user.completedChallenges.map(item => {
      // Make sure the challengeId was populated
      if (!item.challengeId) {
        return null;
      }
      
      return {
        ...item.challengeId.toObject(),
        completedAt: item.completedAt
      };
    }).filter(Boolean); // Remove any null entries
    
    return res.status(200).json(completedChallenges);
    
  } catch (error) {
    console.error('Error getting completed challenges:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Route setup - removed auth middleware
router.get('/', getAllChallenges);
router.get('/all', getAllChallengesAdmin);
router.get('/daily', getDailyChallenge);
router.get('/personalized', getPersonalizedChallenges); 
router.get('/dailychallenges', getDailyChallenges);
router.get('/recommended', getRecommendedChallenges);
router.get('/completed', getCompletedChallenges);
router.get('/:id', getChallengeById);
router.post('/', createChallenge);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

export {
  getAllChallenges,
  getAllChallengesAdmin,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getDailyChallenge,
  getPersonalizedChallenges,
  getDailyChallenges,
  getRecommendedChallenges,
  getCompletedChallenges
};

export default router;