import skillService from '../services/skillService.js';

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
        res.status(200).json(skills);
    } catch (error) {
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
