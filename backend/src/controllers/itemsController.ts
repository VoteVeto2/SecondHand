import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export const createItemValidation = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['ELECTRONICS', 'FURNITURE', 'BOOKS', 'CLOTHING', 'SPORTS', 'APPLIANCES', 'DECORATIONS', 'OTHER']).withMessage('Invalid category'),
  body('condition').trim().isLength({ min: 3 }).withMessage('Condition is required'),
];

export const updateItemValidation = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isIn(['ELECTRONICS', 'FURNITURE', 'BOOKS', 'CLOTHING', 'SPORTS', 'APPLIANCES', 'DECORATIONS', 'OTHER']).withMessage('Invalid category'),
  body('condition').optional().trim().isLength({ min: 3 }).withMessage('Condition is required'),
  body('status').optional().isIn(['AVAILABLE', 'RESERVED', 'SOLD', 'PENDING_PICKUP']).withMessage('Invalid status'),
];

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, category, status, search, priceMin, priceMax } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin as string);
      if (priceMax) where.price.lte = parseFloat(priceMax as string);
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              university: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.item.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
      return;
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            university: true,
            phoneNumber: true,
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

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
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

    const { title, description, price, category, condition, location, tags } = req.body;

    const item = await prisma.item.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        location,
        tags: JSON.stringify(tags || []),
        images: JSON.stringify([]), // For now, empty images
        sellerId: req.user.id,
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            university: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully'
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
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
    const updateData: any = {};

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
      return;
    }

    // Check if user owns the item
    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!existingItem) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      });
      return;
    }

    if (existingItem.sellerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'You can only update your own items'
      });
      return;
    }

    // Build update object
    const { title, description, price, category, condition, status, location, tags } = req.body;

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    const item = await prisma.item.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            university: true,
          }
        }
      }
    });

    // Emit real-time update if status changed
    if (status !== undefined) {
      const io = (req as any).app.get('io');
      if (io) {
        io.emit('item-status-updated', { itemId: id, status });
        io.emit('item-updated', item);
      }
    }

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
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
        error: 'Item ID is required'
      });
      return;
    }

    // Check if user owns the item
    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!existingItem) {
      res.status(404).json({
        success: false,
        error: 'Item not found'
      });
      return;
    }

    if (existingItem.sellerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'You can only delete your own items'
      });
      return;
    }

    await prisma.item.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getUserItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const items = await prisma.item.findMany({
      where: { sellerId: req.user.id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};