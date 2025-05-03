import mongoose from 'mongoose';
import Challenge from '../models/challenge.js';
import User from '../models/user.js';

// XP level thresholds
const levels = [0, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000, 20000];

// Level calculation
const calculateLevel = (xp) => {
  let level = 1;
  for (let i = 1; i < levels.length; i++) {
    if (xp >= levels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  const currentLevelXP = levels[level - 1] || 0;
  const nextLevelXP = levels[level] || currentLevelXP + 1000;
  return { level, currentLevelXP, nextLevelXP };
};

// Add completed flag to challenge list
const addCompletedFlag = (challenges, completedChallengeIds) =>
  challenges.map(challenge => {
    const challengeObj = challenge.toObject?.() ?? challenge;
    return {
      ...challengeObj,
      completed: completedChallengeIds.some(
        id => id.toString() === challengeObj._id.toString()
      )
    };
  });

// Get all challenges (optionally filtered)
export const getAllChallenges = async (req, res) => {
  try {
    const { category } = req.query;
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const query = category && category !== 'all' ? { category } : {};
    const challenges = await Challenge.find(query);
    const result = addCompletedFlag(challenges, user.completedChallenges ?? []);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges', error: error.message });
  }
};

// Get challenges matching user interests
export const getPersonalizedChallenges = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userInterests = user.interests ?? [];
    let challenges = userInterests.length
      ? await Challenge.find({ category: { $in: userInterests } })
      : [];

    if (!challenges.length) challenges = await Challenge.find();

    const result = addCompletedFlag(challenges, user.completedChallenges ?? []);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching personalized challenges:', error);
    res.status(500).json({ message: 'Error fetching personalized challenges', error: error.message });
  }
};

// Get daily challenges
export const getDailyChallenges = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const challenges = await Challenge.find({ dailyChallenge: true });
    const result = addCompletedFlag(challenges, user.completedChallenges ?? []);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching daily challenges:', error);
    res.status(500).json({ message: 'Error fetching daily challenges', error: error.message });
  }
};

// Get recommended challenges
export const getRecommendedChallenges = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userInterests = user.interests ?? [];
    const allChallenges = await Challenge.find();

    const scoredChallenges = allChallenges.map(challenge => {
      const challengeObj = challenge.toObject();
      const interestMatch = challengeObj.tags.filter(tag => userInterests.includes(tag)).length;
      const relevanceScore = interestMatch > 0
        ? (interestMatch / challengeObj.tags.length) * 0.8 + Math.random() * 0.2
        : Math.random() * 0.2;
      return { ...challengeObj, relevanceScore };
    });

    const sorted = scoredChallenges.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const result = addCompletedFlag(sorted, user.completedChallenges ?? []);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching recommended challenges:', error);
    res.status(500).json({ message: 'Error fetching recommended challenges', error: error.message });
  }
};

// Get completed challenges
export const getCompletedChallenges = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId).populate('completedChallenges');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const completed = user.completedChallenges.map(challenge => ({
      ...challenge.toObject(),
      completed: true
    }));
    res.status(200).json(completed);
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    res.status(500).json({ message: 'Error fetching completed challenges', error: error.message });
  }
};

// Get challenge by ID
export const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId; // Get userId from query params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid challenge ID' });
    }

    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isCompleted = user.completedChallenges?.some(
      cid => cid.toString() === id
    ) || false;

    res.status(200).json({ ...challenge.toObject(), completed: isCompleted });
  } catch (error) {
    console.error('Error fetching challenge by ID:', error);
    res.status(500).json({ message: 'Error fetching challenge', error: error.message });
  }
};

// Complete a challenge
export const completeChallenge = async (req, res) => {
  try {
    const { challengeId, userId } = req.body; // Get challengeId and userId from body
    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: 'Invalid challenge ID' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

    if (user.completedChallenges?.some(id => id.toString() === challengeId)) {
      return res.status(200).json({
        ...user.toObject(),
        message: 'Challenge already completed'
      });
    }

    user.completedChallenges ??= [];
    user.completedChallenges.push(challengeId);
    user.xp = (user.xp ?? 0) + challenge.xp;

    const { level, currentLevelXP, nextLevelXP } = calculateLevel(user.xp);
    user.level = level;
    user.completedToday = (user.completedToday ?? 0) + 1;
    if (user.completedToday >= (user.dailyGoal ?? 5)) {
      user.streak = (user.streak ?? 0) + 1;
    }

    const newBadges = [];
    if (user.completedChallenges.length >= 2) {
      newBadges.push({
        id: 'badge1',
        name: 'Challenge Starter',
        description: 'Complete at least 2 challenges'
      });
    }

    await user.save();

    res.status(200).json({
      ...user.toObject(),
      currentLevelXP,
      nextLevelXP,
      newBadges
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ message: 'Error completing challenge', error: error.message });
  }
};

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { currentLevelXP, nextLevelXP } = calculateLevel(user.xp ?? 0);
    res.status(200).json({
      ...user.toObject(),
      currentLevelXP,
      nextLevelXP
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Error fetching user progress', error: error.message });
  }
};
