import Skill from '../models/skill.js'

import mongoose from 'mongoose';


const createSkill = async (skillData) => {
  const skill = new Skill({
    ...skillData,
    user: new mongoose.Types.ObjectId(skillData.user), // 👈 Caster ici
  });

  return await skill.save();
};




const getAllSkills = async () => {
    return await Skill.find().populate('user'); // Récupère les skills avec les infos de l'utilisateur
};

const getSkillById = async (id) => {
    return await Skill.findById(id).populate('user');
};

const updateSkill = async (id, updateData) => {
    return await Skill.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteSkill = async (id) => {
    return await Skill.findByIdAndDelete(id);
};

export default {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill
};
