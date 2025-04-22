import express from 'express';
import Challenge from '../models/challenge.js';

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
 * Create a challenge
 */
const createChallenge = async (req, res) => {
  try {
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

    // Create new challenge
    const newChallenge = new Challenge({
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
    });

    const challenge = await newChallenge.save();
    res.json(challenge);
  } catch (err) {
    console.error(err.message);
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

// Route setup - all routes are public now
router.get('/', getAllChallenges);
router.get('/all', getAllChallengesAdmin);
router.get('/daily', getDailyChallenge);
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
  getDailyChallenge
};

export default router;