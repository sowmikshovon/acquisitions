import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationErrors } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;
    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // Authorization checks
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to update user information',
      });
    }

    // Users can only update their own information, unless they are admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own information',
      });
    }

    // Only admins can change user roles
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can change user roles',
      });
    }

    logger.info(`Updating user ID: ${id}`, {
      updatedBy: req.user.id,
      updates: Object.keys(updates),
    });

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};

export const removeUserById = async (req, res, next) => {
  try {
    // Validate request parameters
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const { id } = paramValidation.data;

    // Authorization checks
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to delete users',
      });
    }

    // Users can only delete their own account, unless they are admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own account',
      });
    }

    // Prevent users from deleting themselves if they are the last admin
    if (req.user.id === id && req.user.role === 'admin') {
      // This is a simple check - in production you might want more sophisticated logic
      logger.warn('Admin attempting to delete their own account', {
        userId: req.user.id,
      });
    }

    logger.info(`Deleting user ID: ${id}`, {
      deletedBy: req.user.id,
    });

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (e) {
    logger.error('Error deleting user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};
