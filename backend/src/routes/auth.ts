import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  registerValidation,
  loginValidation
} from '../controllers/authController';
import { changePassword, changePasswordValidation } from '../controllers/usersController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

export default router;