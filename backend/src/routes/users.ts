import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserItems,
  getUserById,
  getUserStats,
  updateUserValidation,
  changePasswordValidation
} from '../controllers/usersController';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, getUserProfile);

// Update user profile
router.put('/:id', authenticate, updateUserValidation, updateUserProfile);

// Change password
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

// Get user items
router.get('/my-items', authenticate, getUserItems);

// Get user stats
router.get('/stats', authenticate, getUserStats);

// Get user by ID (public)
router.get('/:id', getUserById);

export default router;