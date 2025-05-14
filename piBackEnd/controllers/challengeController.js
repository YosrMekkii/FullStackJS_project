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
    const userId = req.query.userId; // Get userId from query params
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove the category filter logic and fetch all challenges
    const challenges = await Challenge.find(); // No category filter
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
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    // Get user interests from query params if provided, otherwise fetch from user
    let userInterests = req.query.interests ? 
      JSON.parse(req.query.interests) : 
      [];

    // Fetch user data
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If interests weren't provided in query, use the ones from user profile
    if (userInterests.length === 0) {
      userInterests = user.interests || [];
    }

    // Fetch all challenges
    const allChallenges = await Challenge.find();

    // Score challenges based on interests AND category match
    const scoredChallenges = allChallenges.map(challenge => {
      const challengeObj = challenge.toObject();
      
      // 1. Calculate tag/interest match score (existing logic)
      const interestMatchCount = challengeObj.tags.filter(tag => 
        userInterests.includes(tag)).length;
      
      const interestMatchScore = interestMatchCount > 0
        ? (interestMatchCount / challengeObj.tags.length) * 0.5
        : 0;
      
      // 2. Calculate category match score (NEW)
      const categoryMatchScore = userInterests.includes(challengeObj.category) ? 0.3 : 0;
      
      // 3. Add small randomization factor for diversity
      const randomFactor = Math.random() * 0.2;
      
      // 4. Calculate final relevance score (50% interest match, 30% category match, 20% random)
      const relevanceScore = interestMatchScore + categoryMatchScore + randomFactor;
      
      // 5. Add a bonus for daily challenges to prioritize them
      const dailyChallengeBonus = challengeObj.dailyChallenge ? 0.15 : 0;
      
      // 6. Calculate final score with daily challenge bonus
      const finalScore = relevanceScore + dailyChallengeBonus;
      
      // Log scoring for debugging (remove in production)
      console.log(`Challenge ${challengeObj.title} scoring:
        - Interest Match: ${interestMatchScore.toFixed(2)} (${interestMatchCount}/${challengeObj.tags.length} tags)
        - Category Match: ${categoryMatchScore.toFixed(2)} (${userInterests.includes(challengeObj.category)})
        - Random Factor: ${randomFactor.toFixed(2)}
        - Daily Bonus: ${dailyChallengeBonus}
        - Final Score: ${finalScore.toFixed(2)}
      `);
      
      return { 
        ...challengeObj, 
        relevanceScore: finalScore,
        matchDetails: {
          interestMatchScore,
          categoryMatchScore,
          randomFactor,
          dailyChallengeBonus
        }
      };
    });

    // Filter out challenges that have zero interest or category match if we have enough
    let filteredChallenges = scoredChallenges;
    const relevantChallenges = scoredChallenges.filter(c => 
      c.matchDetails.interestMatchScore > 0 || c.matchDetails.categoryMatchScore > 0);
    
    // Only use relevant challenges if we have enough (at least 5)
    if (relevantChallenges.length >= 5) {
      filteredChallenges = relevantChallenges;
    }

    // Sort by relevance score (highest first)
    const sorted = filteredChallenges.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Limit to reasonable number for display
    const limitedResults = sorted.slice(0, 20);
    
    // Add completion status flags
    const result = addCompletedFlag(limitedResults, user.completedChallenges || []);
    
    // Return with recommendation basis (for UI explanation)
    const finalResults = result.map(challenge => {
      let recommendationReason = '';
      
      if (challenge.dailyChallenge) {
        recommendationReason = 'Daily Challenge';
      } else if (userInterests.includes(challenge.category)) {
        recommendationReason = `Based on your interest in ${challenge.category}`;
      } else if (challenge.matchDetails.interestMatchScore > 0) {
        const matchingTags = challenge.tags.filter(tag => userInterests.includes(tag));
        recommendationReason = `Based on your interests: ${matchingTags.join(', ')}`;
      } else {
        recommendationReason = 'Explore something new';
      }
      
      return {
        ...challenge,
        recommendationReason
      };
    });
    
    res.status(200).json(finalResults);
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
export const getChallengesByIds = async (req, res) => {
  try {
    const { challengeIds, userId } = req.body;
    
    if (!challengeIds || !Array.isArray(challengeIds) || challengeIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid challenge IDs array is required' 
      });
    }
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid user ID is required' 
      });
    }
    
    // Validate each challenge ID
    const validIds = challengeIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid challenge IDs provided' 
      });
    }
    
    // Find all challenges that match the IDs
    const challenges = await Challenge.find({ _id: { $in: validIds } });
    
    if (challenges.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No challenges found with the provided IDs' 
      });
    }
    
    // Find the user to check completed challenges
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Convert user's completed challenges to strings for comparison
    const completedChallengeIds = user.completedChallenges?.map(id => id.toString()) || [];
    
    // Add completed flag to each challenge
    const challengesWithCompletion = challenges.map(challenge => {
      const isCompleted = completedChallengeIds.includes(challenge._id.toString());
      return { ...challenge.toObject(), completed: isCompleted };
    });
    
    res.status(200).json({ 
      success: true, 
      data: challengesWithCompletion,
      count: challengesWithCompletion.length
    });
    
  } catch (error) {
    console.error('Error fetching challenges by IDs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching challenges', 
      error: error.message 
    });
  }
};

// Create a challenge
export const createChallenge = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const newChallenge = new AdminChallenge({ title, description, category });
    const savedChallenge = await newChallenge.save();
    res.status(201).json(savedChallenge);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create challenge', error: err.message });
  }
};




// Update a challenge
export const updateChallenge = async (req, res) => {
  try {
    const updatedChallenge = await AdminChallenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedChallenge) return res.status(404).json({ message: 'Challenge not found' });
    res.status(200).json(updatedChallenge);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update challenge', error: err.message });
  }
};

// Delete a challenge
export const deleteChallenge = async (req, res) => {
  try {
    const deleted = await AdminChallenge.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Challenge not found' });
    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete challenge', error: err.message });
  }
};

// Check for badges
export const checkForNewBadges = async (userId, completedChallenges) => {
  const newBadges = [];
  if (completedChallenges.length >= 2) {
    newBadges.push({
      id: 'badge1',
      name: 'Challenge Starter',
      description: 'Complete at least 2 challenges'
    });
  }
  return newBadges;
};


const completeChallenge = async (req, res) => {
  try {
    const { challengeId, userId, completedAt, xp, streak, dailyGoals, isRetry } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Update or create progress entry
    let progress = await Progress.findOne({ userId, challengeId });

    if (progress && isRetry) {
      // Update existing progress for retry
      progress.completedAt = completedAt;
      progress.attempts = (progress.attempts || 0) + 1;
    } else if (!progress) {
      // Create new progress entry
      progress = new Progress({
        userId,
        challengeId,
        completed: true,
        completedAt,
        attempts: 1
      });
    }

    await progress.save();

    // Update user stats (only for non-retries)
    if (!isRetry) {
      user.xp = (user.xp || 0) + xp;
      user.streak = (user.streak || 0) + streak;
      user.dailyGoals = (user.dailyGoals || 0) + dailyGoals;
      
      // Update level based on XP
      user.level = calculateLevel(user.xp);
    } else {
      // For retries, only add the reduced XP
      user.xp = (user.xp || 0) + xp;
      user.level = calculateLevel(user.xp);
    }

    await user.save();

    res.json({
      success: true,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      dailyGoals: user.dailyGoals,
      currentLevelXP: getCurrentLevelXP(user.level),
      nextLevelXP: getNextLevelXP(user.level)
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  completeChallenge
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
