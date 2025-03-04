const User = require("../models/user"); 

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

// Export des fonctions
module.exports = {
  getTotalUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUsersWithCommonSkills , // Export de la nouvelle fonction
};
