import skillService from '../services/skillService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Configure multer storage for skill images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = 'uploads/skills';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, `skill-${Date.now()}${path.extname(file.originalname)}`);
    }
    
});

// File filter to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new skill
const createSkill = async (req, res) => {
    try {
        // Add the path to the uploaded image if it exists
        let skillData = req.body;
        
        if (req.file) {
            skillData.image = `/${req.file.path.replace(/\\/g, '/')}`;
        }
        
        // Ensure user ID is attached from authenticated session
        if (!skillData.user) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        const newSkill = await skillService.createSkill(skillData);
        res.status(201).json({
            success: true,
            message: "Skill created successfully",
            skill: newSkill
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get all skills with optional filtering
const getAllSkills = async (req, res) => {
    try {
        const { category, search } = req.query;
        let skills;
        
        if (category && category !== 'All') {
            skills = await skillService.getSkillsByCategory(category);
        } else if (search) {
            skills = await skillService.searchSkills(search);
        } else {
            skills = await skillService.getAllSkills();
        }
        
        res.status(200).json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get a specific skill by ID
const getSkillById = async (req, res) => {
    try {
        const skill = await skillService.getSkillById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ 
                success: false, 
                message: "Skill not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            skill
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Update a skill
const updateSkill = async (req, res) => {
    try {
        let updateData = req.body;
        
        // Add image path if a new file was uploaded
        if (req.file) {
            updateData.image = `/${req.file.path.replace(/\\/g, '/')}`;
        }
        
        const updatedSkill = await skillService.updateSkill(req.params.id, updateData);
        
        if (!updatedSkill) {
            return res.status(404).json({ 
                success: false, 
                message: "Skill not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Skill updated successfully",
            skill: updatedSkill
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Delete a skill
const deleteSkill = async (req, res) => {
    try {
        const skill = await skillService.getSkillById(req.params.id);
        
        if (!skill) {
            return res.status(404).json({ 
                success: false, 
                message: "Skill not found" 
            });
        }
        
        // Delete the image file if it exists
        if (skill.image && skill.image.startsWith('/uploads/')) {
            const imagePath = path.join(process.cwd(), skill.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await skillService.deleteSkill(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Skill deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Get all skills by a specific user
const getUserSkills = async (req, res) => {
    try {
        const skills = await skillService.getSkillsByUser(req.params.userId);
        
        res.status(200).json({
            success: true,
            count: skills.length,
            skills
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

export default {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    getUserSkills
};