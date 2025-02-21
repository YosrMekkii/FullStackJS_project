const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 🔹 Identifiant unique
  id: { type: mongoose.Schema.Types.ObjectId, auto: true },

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
  country: { type: String, required: true },
  educationLevel: { type: String, required: true },
  interests: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  bio: { type: String, default: "" },
  photoProfil: { type: String, default: "" },
  dateInscription: { type: Date, default: Date.now },

  // 🔹 Sécurité & Vérification
  status: { type: Boolean, default: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // 🔹 Notifications
  notifications: [{ message: String, date: Date }]
});

module.exports = mongoose.model("user", userSchema);