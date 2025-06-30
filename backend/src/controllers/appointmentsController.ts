import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';
import { createEvent } from 'ics';
import nodemailer from 'nodemailer';

export const createAppointmentValidation = [
  body('itemId').isString().notEmpty().withMessage('Item ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

export const updateAppointmentValidation = [
  body('startTime').optional().isISO8601().withMessage('Valid start time is required'),
  body('endTime').optional().isISO8601().withMessage('Valid end time is required'),
  body('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
  body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate calendar event
const generateCalendarEvent = (appointment: any, item: any, seller: any, buyer: any) => {
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  
  const event = {
    start: [
      startTime.getFullYear(),
      startTime.getMonth() + 1,
      startTime.getDate(),
      startTime.getHours(),
      startTime.getMinutes()
    ] as [number, number, number, number, number],
    end: [
      endTime.getFullYear(),
      endTime.getMonth() + 1,
      endTime.getDate(),
      endTime.getHours(),
      endTime.getMinutes()
    ] as [number, number, number, number, number],
    title: `Second-Hand Item Appointment: ${item.title}`,
    description: `Appointment to view/purchase "${item.title}"\nPrice: $${item.price}\nSeller: ${seller.firstName} ${seller.lastName}\nBuyer: ${buyer.firstName} ${buyer.lastName}\n\nNotes: ${appointment.notes || 'None'}`,
    location: appointment.location || 'Location TBD'
  };

  return createEvent(event);
};

// Send appointment email
const sendAppointmentEmail = async (appointment: any, item: any, seller: any, buyer: any, type: 'created' | 'updated' | 'cancelled') => {
  try {
    const transporter = createEmailTransporter();
    
    let subject = '';
    let text = '';
    
    switch (type) {
      case 'created':
        subject = `Appointment Scheduled: ${item.title}`;
        text = `Your appointment has been scheduled!\n\nItem: ${item.title}\nPrice: $${item.price}\nDate: ${new Date(appointment.startTime).toLocaleDateString()}\nTime: ${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}\nLocation: ${appointment.location || 'TBD'}\n\nSeller: ${seller.firstName} ${seller.lastName} (${seller.email})\nBuyer: ${buyer.firstName} ${buyer.lastName} (${buyer.email})\n\nNotes: ${appointment.notes || 'None'}`;
        break;
      case 'updated':
        subject = `Appointment Updated: ${item.title}`;
        text = `Your appointment has been updated!\n\nItem: ${item.title}\nPrice: $${item.price}\nStatus: ${appointment.status}\nDate: ${new Date(appointment.startTime).toLocaleDateString()}\nTime: ${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}\nLocation: ${appointment.location || 'TBD'}\n\nSeller: ${seller.firstName} ${seller.lastName} (${seller.email})\nBuyer: ${buyer.firstName} ${buyer.lastName} (${buyer.email})\n\nNotes: ${appointment.notes || 'None'}`;
        break;
      case 'cancelled':
        subject = `Appointment Cancelled: ${item.title}`;
        text = `Your appointment has been cancelled.\n\nItem: ${item.title}\nOriginal Date: ${new Date(appointment.startTime).toLocaleDateString()}\nOriginal Time: ${new Date(appointment.startTime).toLocaleTimeString()} - ${new Date(appointment.endTime).toLocaleTimeString()}\n\nSeller: ${seller.firstName} ${seller.lastName} (${seller.email})\nBuyer: ${buyer.firstName} ${buyer.lastName} (${buyer.email})`;
        break;
    }

    // Generate calendar event for creation/update
    let icsAttachment = null;
    if (type !== 'cancelled') {
      const calendarResult = generateCalendarEvent(appointment, item, seller, buyer);
      if (calendarResult.value) {
        icsAttachment = {
          filename: 'appointment.ics',
          content: calendarResult.value,
          contentType: 'text/calendar'
        };
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: [seller.email, buyer.email],
      subject,
      text,
      attachments: icsAttachment ? [icsAttachment] : []
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending appointment email:', error);
  }
};

export const getAllAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { status, upcoming } = req.query;
    const where: any = {
      OR: [
        { sellerId: req.user.id },
        { buyerId: req.user.id }
      ]
    };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.startTime = {
        gte: new Date()
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            status: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            status: true,
            category: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            university: true
          }
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            university: true
          }
        }
      }
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    // Check if user is involved in this appointment
    if (appointment.sellerId !== req.user.id && appointment.buyerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { itemId, startTime, endTime, location, notes } = req.body;

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      res.status(400).json({
        success: false,
        error: 'Appointment cannot be scheduled in the past'
      });
      return;
    }

    if (end <= start) {
      res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
      return;
    }

    // Check if item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      });
      return;
    }

    if (item.status !== 'AVAILABLE') {
      res.status(400).json({
        success: false,
        error: 'Item is not available for appointments'
      });
      return;
    }

    if (item.sellerId === req.user.id) {
      res.status(400).json({
        success: false,
        error: 'You cannot book an appointment for your own item'
      });
      return;
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        itemId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      res.status(409).json({
        success: false,
        error: 'Time slot is already booked'
      });
      return;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        itemId,
        sellerId: item.sellerId,
        buyerId: req.user.id,
        startTime: start,
        endTime: end,
        location: location || null,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update item status to reserved
    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'RESERVED' }
    });

    // Emit real-time update
    const socketIo = (req as any).app.get('io');
    if (socketIo) {
      socketIo.emit('item-status-updated', { itemId, status: 'RESERVED' });
    }

    // Create notifications
    const notifications = await Promise.all([
      // Notification for seller
      prisma.notification.create({
        data: {
          userId: item.sellerId,
          type: 'APPOINTMENT_BOOKED',
          title: 'New Appointment Request',
          message: `A user has requested to view "${item.title}"`,
          metadata: JSON.stringify({ appointmentId: appointment.id, itemId })
        }
      }),
      // Notification for buyer
      prisma.notification.create({
        data: {
          userId: req.user.id,
          type: 'APPOINTMENT_BOOKED',
          title: 'Appointment Request Sent',
          message: `Your appointment request for "${item.title}" has been sent to the seller`,
          metadata: JSON.stringify({ appointmentId: appointment.id, itemId })
        }
      })
    ]);

    // Emit real-time notifications
    const notificationIo = (req as any).app.get('io');
    if (notificationIo) {
      notificationIo.to(`user-${item.sellerId}`).emit('notification', notifications[0]);
      notificationIo.to(`user-${req.user.id}`).emit('notification', notifications[1]);
    }

    // Send email notification
    await sendAppointmentEmail(appointment, item, appointment.seller, appointment.buyer, 'created');

    // Emit real-time appointment created event
    const appointmentIo = (req as any).app.get('io');
    if (appointmentIo) {
      appointmentIo.to(`user-${item.sellerId}`).emit('appointment-created', appointment);
      appointmentIo.to(`user-${req.user.id}`).emit('appointment-created', appointment);
    }

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;
    const { startTime, endTime, status, location, notes } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
      return;
    }

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        item: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!existingAppointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    // Check permissions
    if (existingAppointment.sellerId !== req.user.id && existingAppointment.buyerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    const updateData: any = {};

    // Time validation if times are being updated
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : existingAppointment.startTime;
      const end = endTime ? new Date(endTime) : existingAppointment.endTime;
      const now = new Date();

      if (start <= now) {
        res.status(400).json({
          success: false,
          error: 'Appointment cannot be scheduled in the past'
        });
        return;
      }

      if (end <= start) {
        res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
        return;
      }

      updateData.startTime = start;
      updateData.endTime = end;
    }

    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;

    // Update appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Handle status changes
    if (status === 'COMPLETED') {
      await prisma.item.update({
        where: { id: existingAppointment.itemId },
        data: { status: 'SOLD' }
      });
      
      // Emit real-time update
      const statusIo = (req as any).app.get('io');
      if (statusIo) {
        statusIo.emit('item-status-updated', { itemId: existingAppointment.itemId, status: 'SOLD' });
      }
    } else if (status === 'CANCELLED') {
      await prisma.item.update({
        where: { id: existingAppointment.itemId },
        data: { status: 'AVAILABLE' }
      });
      
      // Emit real-time update
      const updateIo = (req as any).app.get('io');
      if (updateIo) {
        updateIo.emit('item-status-updated', { itemId: existingAppointment.itemId, status: 'AVAILABLE' });
      }
    }

    // Create notifications
    const otherUserId = req.user.id === existingAppointment.sellerId ? 
      existingAppointment.buyerId : existingAppointment.sellerId;
    
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'APPOINTMENT_UPDATED',
        title: 'Appointment Updated',
        message: `The appointment for "${existingAppointment.item.title}" has been updated`,
        metadata: JSON.stringify({ appointmentId: id, itemId: existingAppointment.itemId })
      }
    });

    // Send email notification
    await sendAppointmentEmail(appointment, appointment.item, appointment.seller, appointment.buyer, 'updated');

    // Emit real-time appointment updated event
    const updatedIo = (req as any).app.get('io');
    if (updatedIo) {
      updatedIo.to(`user-${existingAppointment.sellerId}`).emit('appointment-updated', appointment);
      updatedIo.to(`user-${existingAppointment.buyerId}`).emit('appointment-updated', appointment);
    }

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        item: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
      return;
    }

    // Check permissions
    if (appointment.sellerId !== req.user.id && appointment.buyerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    // Update appointment status
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        buyer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Update item status back to available
    await prisma.item.update({
      where: { id: appointment.itemId },
      data: { status: 'AVAILABLE' }
    });

    // Emit real-time update
    const cancelIo = (req as any).app.get('io');
    if (cancelIo) {
      cancelIo.emit('item-status-updated', { itemId: appointment.itemId, status: 'AVAILABLE' });
    }

    // Create notifications
    const otherUserId = req.user.id === appointment.sellerId ? 
      appointment.buyerId : appointment.sellerId;
    
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment Cancelled',
        message: `The appointment for "${appointment.item.title}" has been cancelled`,
        metadata: JSON.stringify({ appointmentId: id, itemId: appointment.itemId })
      }
    });

    // Send email notification
    await sendAppointmentEmail(cancelledAppointment, cancelledAppointment.item, cancelledAppointment.seller, cancelledAppointment.buyer, 'cancelled');

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getItemAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
      return;
    }

    // Check if user owns the item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { sellerId: true }
    });

    if (!item) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      });
      return;
    }

    if (item.sellerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied'
      });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { itemId },
      include: {
        buyer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get item appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};