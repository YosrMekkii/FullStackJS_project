// routes/matchRoutes.js
import express from 'express';
import Match from '../models/match.js'; // Make sure to add the .js extension

const router = express.Router();

// Create a new match
router.post('/', async (req, res) => {
  try {
    const { userId, matchedUserId, createdAt } = req.body;
    
    // Validate required fields
    if (!userId || !matchedUserId) {
      return res.status(400).json({ error: 'userId and matchedUserId are required' });
    }
    
    // Check if match already exists to prevent duplicates
    const existingMatch = await Match.findOne({ 
      userId, 
      matchedUserId 
    });
    
    if (existingMatch) {
      return res.status(200).json(existingMatch);
    }
    
    // Create new match
    const newMatch = new Match({
      userId,
      matchedUserId,
      createdAt: createdAt || new Date().toISOString()
    });
    
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Important: Put specific routes before more general ones
// This route must come before '/:userId' or it won't be reached
router.get('/mutual/:userId/:matchedUserId', async (req, res) => {
  try {
    const { userId, matchedUserId } = req.params;
    
    const mutualMatch = await Match.findOne({ 
      userId: matchedUserId, 
      matchedUserId: userId 
    });
    
    res.status(200).json({ isMutual: !!mutualMatch });
  } catch (error) {
    console.error('Error checking mutual match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all matches for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching matches for user ${userId}`);
    
    const matches = await Match.find({ userId });
    console.log(`Found ${matches.length} matches`);
    res.status(200).json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/getmatchesfor/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const matches = await Match.find({
      $or: [
        { userId, status: 'accepted' },
        { matchedUserId: userId, status: 'accepted' }
      ]
    });

    const detailedMatches = await Promise.all(matches.map(async (match) => {
      const isInitiator = match.userId === userId;
      const partnerId = isInitiator ? match.matchedUserId : match.userId;

      const partner = await User.findById(partnerId).select(
        'firstName lastName profileImagePath'
      );

      return {
        id: match._id,
        startDate: match.createdAt.toDateString(),
        status: 'Active',
        partner: {
          name: `${partner?.firstName || 'Unknown'} ${partner?.lastName || ''}`,
          avatar: partner?.profileImagePath || '/default-avatar.png'
        },
        skillShared: isInitiator ? 'Your Skill' : 'Their Skill',
        skillLearned: isInitiator ? 'Their Skill' : 'Your Skill'
      };
    }));

    res.status(200).json(detailedMatches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete a match
router.delete('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const deletedMatch = await Match.findByIdAndDelete(matchId);
    
    if (!deletedMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    res.status(200).json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;