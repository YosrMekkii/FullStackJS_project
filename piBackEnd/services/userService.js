import User from "../models/user.js";

// ✅ Créer un utilisateur
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`❌ Erreur lors de la création de l'utilisateur: ${error.message}`);
  }
};

// ✅ Récupérer un utilisateur par ID
const getUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw new Error(`❌ Erreur lors de la récupération de l'utilisateur: ${error.message}`);
  }
};

// ✅ Mettre à jour un utilisateur
const updateUser = async (userId, updateData) => {
  try {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  } catch (error) {
    throw new Error(`❌ Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
  }
};

// ✅ Supprimer un utilisateur
const deleteUser = async (userId) => {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (error) {
    throw new Error(`❌ Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
};

/**
 * Get user progress
 */
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Calculate XP for next level
    const nextLevelXP = user.level * 1000;
    const currentLevelXP = (user.level - 1) * 1000;

    const progress = {
      xp: user.xp,
      level: user.level,
      currentLevelXP,
      nextLevelXP,
      streak: user.streak || 0,
      completedToday: user.completedToday || 0,
      dailyGoal: user.dailyGoal || 5,
      interests: user.interests || []
    };

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Update user interests
 */
const updateUserInterests = async (req, res) => {
  try {
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user interests
    user.interests = req.body.interests;
    await user.save();

    res.json({ success: true, interests: user.interests });
  } catch (err) {
    console.error('Error updating user interests:', err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get completed challenges for the user
 */
const getCompletedChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.completedChallenges || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Complete a challenge
 */
const completeChallenge = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { challengeId } = req.params;
    
    // Check if challenge already completed
    if (user.completedChallenges && user.completedChallenges.includes(challengeId)) {
      return res.status(400).json({ msg: 'Challenge already completed' });
    }

    // Add challenge to completed challenges
    if (!user.completedChallenges) {
      user.completedChallenges = [];
    }
    user.completedChallenges.push(challengeId);

    // Update XP and level
    // We would typically fetch the challenge to get its XP value
    // For now, we'll use a fixed amount
    const xpGained = 100; // Example value
    user.xp += xpGained;

    // Update level if necessary
    const nextLevelXP = user.level * 1000;
    if (user.xp >= nextLevelXP) {
      user.level += 1;
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    if (!user.lastCompletedDate || user.lastCompletedDate !== today) {
      user.completedToday = 1;
      
      // Update streak - increment if consecutive day, otherwise reset to 1
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (user.lastCompletedDate === yesterdayStr) {
        user.streak += 1;
      } else if (user.lastCompletedDate !== today) {
        user.streak = 1;
      }
      
      user.lastCompletedDate = today;
    } else {
      // Same day, just increment completedToday counter
      user.completedToday += 1;
    }

    await user.save();

    // Return updated progress
    const currentLevelXP = (user.level - 1) * 1000;
    const progress = {
      xp: user.xp,
      level: user.level,
      currentLevelXP,
      nextLevelXP,
      streak: user.streak,
      completedToday: user.completedToday,
      dailyGoal: user.dailyGoal || 5
    };

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// ✅ Récupérer tous les utilisateurs
const getAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw new Error(`❌ Erreur lors de la récupération des utilisateurs: ${error.message}`);
  }
};
// ✅ Récupérer un utilisateur par email
const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    throw new Error(`❌ Erreur lors de la récupération de l'utilisateur par email: ${error.message}`);
  }
};

// ✅ Trouver des utilisateurs avec des compétences communes
const getUsersWithCommonSkills = async (userId, userSkills) => {
  try {
    // Recherche des utilisateurs ayant des compétences communes avec l'utilisateur
    return await User.find({
      _id: { $ne: userId },  // Exclure l'utilisateur courant
      skills: { $in: userSkills }  // Trouver des utilisateurs avec au moins une compétence en commun
    });
  } catch (error) {
    throw new Error(`❌ Erreur lors de la recherche des utilisateurs avec des compétences communes: ${error.message}`);
  }
};


const getTotalUsers = async () => {
  return await User.countDocuments();
};


const uploadProfileImageService = async (userId, filePath) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("Utilisateur non trouvé");

    user.profileImagePath = filePath; // Assigne le chemin du fichier
    await user.save();

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Accès refusé, aucun token fourni" });
  }

  if (blacklist.has(token)) {
    return res.status(403).json({ error: "Token invalide, veuillez vous reconnecter" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};


// Export des fonctions
export  {
  uploadProfileImageService,
  getTotalUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUsersWithCommonSkills , // Export de la nouvelle fonction
  authenticateToken,
  getUserProgress,
  updateUserInterests,
  getCompletedChallenges,
  completeChallenge
};

