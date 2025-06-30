import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getItemAppointments,
  createAppointmentValidation,
  updateAppointmentValidation
} from '../controllers/appointmentsController';

const router = express.Router();

// Get all appointments for authenticated user
router.get('/', authenticate, getAllAppointments);

// Create new appointment
router.post('/', authenticate, createAppointmentValidation, createAppointment);

// Get appointment by ID
router.get('/:id', authenticate, getAppointmentById);

// Update appointment
router.put('/:id', authenticate, updateAppointmentValidation, updateAppointment);

// Cancel appointment
router.delete('/:id', authenticate, cancelAppointment);

// Get appointments for specific item (seller only)
router.get('/item/:itemId', authenticate, getItemAppointments);

export default router;