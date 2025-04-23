import skillService from '../services/skillService.js';
import * as userService from '../services/userService.js';
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
      const skills = await skillService.getAllSkills();
      
      const skillsWithUser = await Promise.all(skills.map(async (skill) => {
        try {
          const user = await userService.getUserById(skill.user);
          skill.user = {
            name: `${user.firstName} ${user.lastName}`
          };
        } catch (err) {
          console.error(`Erreur lors de la récupération de l'utilisateur pour la compétence ${skill._id}`, err);
          skill.user = { name: 'Utilisateur inconnu' };
        }
        return skill;
      }));
      
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

export default {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill
};
