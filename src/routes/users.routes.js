import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  removeUserById,
} from '#controllers/users.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users
router.get('/', fetchAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', fetchUserById);

// PUT /api/users/:id - Update user by ID
router.put('/:id', updateUserById);

// DELETE /api/users/:id - Delete user by ID
router.delete('/:id', removeUserById);

export default router;
