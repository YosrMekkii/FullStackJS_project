import Skill from '../models/skill.js'

const createSkill = async (skillData) => {
    try {
        const newSkill = new Skill(skillData);
        await newSkill.save();
        return newSkill;
    } catch (error) {
        throw new Error(`Error creating skill: ${error.message}`);
    }
};

const getAllSkills = async () => {
    try {
        return await Skill.find().populate('user', 'firstName lastName profileImagePath'); // Populate user details
    } catch (error) {
        throw new Error(`Error fetching skills: ${error.message}`);
    }
};

const getSkillById = async (id) => {
    try {
        return await Skill.findById(id).populate('user', 'firstName lastName profileImagePath email');
    } catch (error) {
        throw new Error(`Error fetching skill: ${error.message}`);
    }
};

const updateSkill = async (id, updateData) => {
    try {
        return await Skill.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        throw new Error(`Error updating skill: ${error.message}`);
    }

const deleteSkill = async (id) => {
    try {
        return await Skill.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error deleting skill: ${error.message}`);
    }
};

const getSkillsByCategory = async (category) => {
    try {
        return await Skill.find({ category }).populate('user', 'firstName lastName profileImagePath');
    } catch (error) {
        throw new Error(`Error fetching skills by category: ${error.message}`);
    }
};

const getSkillsByUser = async (userId) => {
    try {
        return await Skill.find({ user: userId });
    } catch (error) {
        throw new Error(`Error fetching user skills: ${error.message}`);
    }
};

const searchSkills = async (searchTerm) => {
    try {
        return await Skill.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } }
            ]
        }).populate('user', 'firstName lastName profileImagePath');
    } catch (error) {
        throw new Error(`Error searching skills: ${error.message}`);
    }
};

export default {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    getSkillsByCategory,
    getSkillsByUser,
    searchSkills
};
