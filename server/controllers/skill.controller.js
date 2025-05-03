import mongoose from 'mongoose';

import { handleError } from '##/server/utility/utility.js';

const Skill = mongoose.model('Skill');

// Create a new skill
async function createSkill(req, res) {
    try {
        const { name, category, description } = req.body;

        // Check if skill already exists
        const existingSkill = await Skill.findOne({ name });
        if (existingSkill) {
            return res.status(400).json({ message: 'Skill already exists' });
        }

        const newSkill = new Skill({
            name,
            category,
            description
        });

        const skill = await newSkill.save();
        return res.status(201).json({ skill });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get all skills
async function getAllSkills(req, res) {
    try {
        // Build filter object
        const filterObj = {};

        if (req.query.category) filterObj.category = req.query.category;

        const skills = await Skill.find(filterObj)
            .sort({ name: 1 })
            .lean();

        return res.json({ skills });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get skill by ID
async function getSkillById(req, res) {
    try {
        const { skillId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({ message: 'Invalid skill ID' });
        }

        const skill = await Skill.findById(skillId).lean();

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        return res.json({ skill });
    } catch (error) {
        return handleError(res, error);
    }
}

// Update skill
async function updateSkill(req, res) {
    try {
        const { skillId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({ message: 'Invalid skill ID' });
        }

        const { name, category, description } = req.body;

        // Build update object dynamically
        const updateData = {};
        if (name) updateData.name = name;
        if (category) updateData.category = category;
        if (description) updateData.description = description;

        // Check if skill with same name already exists (but different ID)
        if (name) {
            const existingSkill = await Skill.findOne({ name, _id: { $ne: skillId } });
            if (existingSkill) {
                return res.status(400).json({ message: 'Skill name already exists' });
            }
        }

        const updatedSkill = await Skill.findByIdAndUpdate(
            skillId,
            { $set: updateData },
            { new: true, runValidators: true, lean: true }
        );

        if (!updatedSkill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        return res.json({ skill: updatedSkill });
    } catch (error) {
        return handleError(res, error);
    }
}

// Delete skill
async function deleteSkill(req, res) {
    try {
        const { skillId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({ message: 'Invalid skill ID' });
        }

        const skill = await Skill.findById(skillId);

        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        // TODO: Check if the skill is being used by any resources
        // If yes, prevent deletion or implement a soft delete

        await Skill.findByIdAndDelete(skillId);

        return res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        return handleError(res, error);
    }
}

// Get skills by category
async function getSkillsByCategory(req, res) {
    try {
        const skills = await Skill.aggregate([
            {
                $group: {
                    _id: "$category",
                    skills: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    category: "$_id",
                    skills: 1,
                    _id: 0
                }
            },
            {
                $sort: { category: 1 }
            }
        ]);

        return res.json({ categorySkills: skills });
    } catch (error) {
        return handleError(res, error);
    }
}

export {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    getSkillsByCategory
};