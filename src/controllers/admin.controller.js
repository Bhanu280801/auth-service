import TokenBlacklist from '../models/TokenBlacklist.js';
import User from '../models/User.js';

// @desc   Get all blacklisted tokens (admin only)
// @route  GET /api/auth/admin/blacklist
// @access Private/Admin
export const getBlacklist = async (req, res) => {
  try {
    const tokens = await TokenBlacklist.find({}).select('-__v -_id').lean();
    return res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    console.error('Error fetching blacklist', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Get all users (admin only)
// @route  GET /api/auth/admin/users
// @access Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -twoFactorSecret -googleId -otp -otpExpires -otpVerified').lean();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Update user role (admin only)
// @route  PATCH /api/auth/admin/users/:id/role
// @access Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -twoFactorSecret -googleId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user, message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc   Delete user (admin only)
// @route  DELETE /api/auth/admin/users/:id
// @access Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

