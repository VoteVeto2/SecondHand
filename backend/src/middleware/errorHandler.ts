import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = 'Invalid input data';
    error = { ...error, message, statusCode: 400 };
  }

  // Prisma known request error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const message = 'Duplicate field value entered';
      error = { ...error, message, statusCode: 400 };
    }
    if (err.code === 'P2025') {
      const message = 'Record not found';
      error = { ...error, message, statusCode: 404 };
    }
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, message, statusCode: 401 };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, message, statusCode: 401 };
  }

  // Validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err as any).map((val: any) => val.message).join(', ');
    error = { ...error, message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};