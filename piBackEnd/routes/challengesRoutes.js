// routes/challenges.js
const express = require('express');
const router = express.Router();
const Challenge = require('../models/models/Challenge');
const User = require('../models/models/User');
const auth = require('../middleware/auth'); // Authentication middleware

// Get challenges based on user interests
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find challenges that match user interests or get all if no interests
    const query = user.interests && user.interests.length > 0 
      ? { tags: { $in: user.interests } }
      : {};
      
    const challenges = await Challenge.find(query)
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json(challenges);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get daily challenges
router.get('/daily', auth, async (req, res) => {
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get user for interest-based filtering
    const user = await User.findById(req.user.id);
    
    // Find daily challenges that match user interests
    const query = {
      dailyChallenge: true,
      createdAt: { $gte: today },
      ...(user.interests && user.interests.length > 0 
        ? { tags: { $in: user.interests } } 
        : {})
    };
    
    const dailyChallenges = await Challenge.find(query).limit(5);
    
    res.json(dailyChallenges);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Complete a challenge
router.post('/complete/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ msg: 'Challenge not found' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Check if user already completed this challenge
    const alreadyCompleted = user.completedChallenges.some(
      item => item.challengeId.toString() === req.params.id
    );
    
    if (alreadyCompleted) {
      return res.status(400).json({ msg: 'Challenge already completed' });
    }
    
    // Add XP and record completion
    user.xp += challenge.xp;
    user.completedChallenges.push({ challengeId: challenge._id });
    
    // Update level
    user.level = user.calculateLevel();
    
    // Update streak if it's a daily challenge
    if (challenge.dailyChallenge) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last challenge was completed yesterday, increment streak
      if (user.lastDailyChallenge && user.lastDailyChallenge >= yesterday) {
        user.dailyStreak += 1;
      } else {
        // Reset streak if more than a day has passed
        user.dailyStreak = 1;
      }
      
      user.lastDailyChallenge = new Date();
    }
    
    await user.save();
    
    res.json({
      xp: user.xp,
      level: user.level,
      streak: user.dailyStreak
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate XP needed for next level
    const currentLevelXP = (user.level - 1) * 1000;
    const nextLevelXP = user.level * 1000;
    
    // Count completed daily challenges today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = user.completedChallenges.filter(
      item => item.completedAt >= today
    ).length;
    
    res.json({
      xp: user.xp,
      level: user.level,
      currentLevelXP,
      nextLevelXP,
      streak: user.dailyStreak,
      completedToday,
      dailyGoal: 5 // Configurable
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;