import skillService from '../services/skillService.js';
import * as userService from '../services/userService.js';
import Skill from '../models/skill.js';  // Adjust the path according to your project structure

const createSkill = async (req, res) => {
    try {
        const newSkill = await skillService.createSkill(req.body);
        res.status(201).json(newSkill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllSkills = async (req, res) => {
    try {
      // 1. Récupérer toutes les compétences
      const skills = await skillService.getAllSkills();
      
      // 2. Enrichir chaque compétence avec les données utilisateur
      const skillsWithUser = await Promise.all(skills.map(async (skill) => {
        // Convertir l'objet skill Mongoose en objet JavaScript simple
        const skillObj = skill.toObject();
        
        try {
          // 3. Si l'ID utilisateur existe
          if (skillObj.user) {
            // 4. Récupérer l'utilisateur par son ID
            const user = await userService.getUserById(skillObj.user);
            
            // 5. Si l'utilisateur existe, ajouter ses informations
            if (user) {
              // IMPORTANT: Conserver l'ID original + ajouter le nom
              skillObj.user = {
                _id: user._id.toString(), // Convertir l'ObjectId en string
                name: `${user.firstName} ${user.lastName}`
              };
            } else {
              // 6. Si l'utilisateur n'est pas trouvé
              skillObj.user = { 
                name: 'Utilisateur inconnu' 
              };
            }
          }
          return skillObj;
        } catch (err) {
          console.error(`Erreur lors de la récupération de l'utilisateur pour la compétence ${skillObj._id}:`, err);
          skillObj.user = { name: 'Utilisateur inconnu' };
          return skillObj;
        }
      }));
      
      // 7. Retourner les compétences enrichies
      res.status(200).json(skillsWithUser);
    } catch (error) {
      console.error("Erreur dans getAllSkills:", error);
      res.status(500).json({ error: error.message });
    }
  };


const getSkillById = async (req, res) => {
    try {
        const skill = await skillService.getSkillById(req.params.id);
        if (!skill) return res.status(404).json({ message: "Skill not found" });
        res.status(200).json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSkill = async (req, res) => {
    try {
        const updatedSkill = await skillService.updateSkill(req.params.id, req.body);
        if (!updatedSkill) return res.status(404).json({ message: "Skill not found" });
        res.status(200).json(updatedSkill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteSkill = async (req, res) => {
    try {
        const deletedSkill = await skillService.deleteSkill(req.params.id);
        if (!deletedSkill) return res.status(404).json({ message: "Skill not found" });
        res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const likeSkill = async (req, res) => {
    try {
      const skill = await Skill.findById(req.params.id);
      const userId = req.body.userId;
  
      if (!skill) return res.status(404).json({ message: 'Skill not found' });
  
      if (skill.likedBy.includes(userId)) {
        return res.status(400).json({ message: 'Already liked' });
      }
      skill.likes += 1;
    skill.likedBy.push(userId);

    await skill.save();
    res.status(200).json({ message: 'Skill liked', skill });
  } catch (error) {
    res.status(500).json({ message: 'Error liking skill', error });
  }
};

const unlikeSkill = async (req, res) => {
    try {
      const skill = await Skill.findById(req.params.id);
      const userId = req.body.userId;
  
      if (!skill) return res.status(404).json({ message: 'Skill not found' });
  
      if (!skill.likedBy.includes(userId)) {
        return res.status(400).json({ message: 'You haven\'t liked this skill' });
      }
  
      skill.likes -= 1;
      skill.likedBy = skill.likedBy.filter(id => id.toString() !== userId);
  
      await skill.save();
      res.status(200).json({ message: 'Skill unliked', skill });
    } catch (error) {
      res.status(500).json({ message: 'Error unliking skill', error });
    }
  };


const getSkillsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const skills = await Skill.find({ user: userId }).populate('user', 'firstName lastName');
    res.status(200).json(skills);
  } catch (error) {
    console.error('Erreur lors de la récupération des compétences :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des compétences.' });
  }
};


export default {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    likeSkill,
    unlikeSkill,
    getSkillsByUserId
};
