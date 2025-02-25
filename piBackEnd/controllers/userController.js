const userService = require("../services/userService");

// ✅ Créer un utilisateur
const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Recommander des utilisateurs avec des compétences communes
const getRecommendations = async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Fetch the current user by ID
    const currentUser = await userService.getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch users with common skills (excluding the current user)
    const recommendedUsers = await userService.getUsersWithCommonSkills(userId, currentUser.skills);

    // Send the recommended users
    res.status(200).json({ recommendedUsers });
  } catch (error) {
    console.error("Error finding recommendations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Update skills (skills offered)
const updateSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;

    const user = await userService.updateUser(id, { skills: skills });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Compétences mises à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update interests (skills wanted)
const updateInterests = async (req, res) => {
  try {
    const { id } = req.params;
    const { interests } = req.body;

    const user = await userService.updateUser(id, { interests: interests });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.status(200).json({ message: "Intérêts mis à jour avec succès", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getRecommendations,// Export the recommendation function
  updateSkills,
  updateInterests,
};
