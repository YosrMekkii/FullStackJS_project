import mongoose from 'mongoose';
import path from "path";

const userSchema = new mongoose.Schema({
  // 🔹 Identifiant unique
  //id: { type: mongoose.Schema.Types.ObjectId, auto: true },

  // 🔹 Authentification & Sécurité
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: false },

  // 🔹 Informations personnelles & Profil
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  educationLevel: { type: String, required: true },
  interests: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  achievements: { type: [String], default: [] },
  bio: { type: String, default: "" },
   // 📷 Image de profil
   profileImagePath: { type: String, default: "" },  // Chemin d'accès du fichier
   profileImageFilename: { type: String, default: "" }, // Nom du fichier
  // 🔹 Statistiques 
  dateInscription: { type: Date, default: Date.now },
  // 🔹 Interaction Data
  interactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],  // ✅ Users they engaged with
  // 🔹 Sécurité & Vérification
  status: { type: Boolean, default: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // 🔹 Notifications
  notifications: [{ message: String, date: Date }],
  
  isVerified: { type: Boolean, default: false },

  //challenges related data
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  completedChallenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    completedAt: { type: Date, default: Date.now }
  }],
  dailyStreak: { type: Number, default: 0 },
  lastDailyChallenge: { type: Date },
  badges: [{
    name: String,
    description: String,
    icon: String,
    achievedAt: Date
  }]
});
UserSchema.methods.calculateLevel = function() {
  // Simple level calculation: level = 1 + floor(xp / 1000)
  return Math.floor(1 + (this.xp / 1000));
};

//module.exports = mongoose.model("user", userSchema);
const User = mongoose.model("User", userSchema);
export default User;
