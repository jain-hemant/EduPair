import mongoose from 'mongoose';
import { handleError } from '##/server/utility/utility.js';

const User = mongoose.model('User');
const Skill = mongoose.model('Skill');
// Get current user profile
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.userId; // Assuming middleware sets this

    const user = await User.findById(userId)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'name username avatar'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    return handleError(res, error);
  }
}

// Get user by ID
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(userId)
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .populate({
        path: 'reviews',
        populate: {
          path: 'reviewer',
          select: 'name username avatar'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return public user data (no password)
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    return handleError(res, error);
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .select('-password')
      .populate('skillsToTeach')
      .populate('skillsToLearn')
      .lean();

    return res.json({ users });
  } catch (error) {
    return handleError(res, error);
  }
}

// Update user
async function updateUser(req, res) {
  try {
    const userId = req.params.userId || req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { name, bio, avatar, skillsToTeach, skillsToLearn } = req.body;

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    // Validate skills if provided
    if (skillsToTeach) {
      for (const skillId of skillsToTeach) {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
          return res.status(400).json({ message: 'Invalid skill ID in skillsToTeach' });
        }

        const skillExists = await Skill.findById(skillId);
        if (!skillExists) {
          return res.status(404).json({ message: `Skill with ID ${skillId} not found` });
        }
      }
      updateData.skillsToTeach = skillsToTeach;
    }

    if (skillsToLearn) {
      for (const skillId of skillsToLearn) {
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
          return res.status(400).json({ message: 'Invalid skill ID in skillsToLearn' });
        }

        const skillExists = await Skill.findById(skillId);
        if (!skillExists) {
          return res.status(404).json({ message: `Skill with ID ${skillId} not found` });
        }
      }
      updateData.skillsToLearn = skillsToLearn;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('skillsToTeach')
      .populate('skillsToLearn');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    return handleError(res, error);
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.isValidPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return handleError(res, error);
  }
}

// Update credit balance
async function updateCreditBalance(req, res) {
  try {
    const { userId } = req.params;
    const { amount, operation } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({ message: 'Operation must be either "add" or "subtract"' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update credit balance
    if (operation === 'add') {
      user.creditBalance += amount;
    } else {
      // Check if user has enough credits
      if (user.creditBalance < amount) {
        return res.status(400).json({ message: 'Insufficient credit balance' });
      }
      user.creditBalance -= amount;
    }

    await user.save();

    return res.json({
      message: 'Credit balance updated successfully',
      userId,
      newBalance: user.creditBalance
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export {
  getCurrentUser,
  getUserById,
  getAllUsers,
  updateUser,
  changePassword,
  updateCreditBalance
};