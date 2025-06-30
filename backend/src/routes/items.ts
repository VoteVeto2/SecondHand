import express from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getUserItems,
  createItemValidation,
  updateItemValidation
} from '../controllers/itemsController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllItems);
router.get('/my-items', authenticate, getUserItems);
router.get('/:id', getItemById);

// Protected routes
router.post('/', authenticate, createItemValidation, createItem);
router.put('/:id', authenticate, updateItemValidation, updateItem);
router.delete('/:id', authenticate, deleteItem);

export default router;