import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String, // URL de l'image
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Référence au modèle User
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

}, { timestamps: true }); // Ajoute createdAt et updatedAt

const Skill = mongoose.model('Skill', skillSchema);

//module.exports = Skill;
export default Skill;
