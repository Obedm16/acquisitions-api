import logger from '#config/logger.js';
import { formaValidationError } from '#utils/format.js';
import { getAllUSers, getUserById, updateUser as updateUserService, deleteUser as deleteUserService } from '#services/users.service.js';
import { updateUserSchema, userIdSchema } from '#validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUSers();

    res.status(200).json({
      message: 'Successfully retrieved all users',
      data: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error('Failed to get users', e);
    next(e);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formaValidationError(idResult.error),
      });
    }

    const { id } = idResult.data;

    logger.info(`Getting user by id: ${id}`);

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User retrieved', data: user });
  } catch (e) {
    logger.error('Failed to get user by id', e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formaValidationError(idResult.error),
      });
    }
    const { id } = idResult.data;

    const bodyResult = updateUserSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formaValidationError(bodyResult.error),
      });
    }

    const updates = bodyResult.data;

    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = requester.role === 'admin';
    const isSelf = requester.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!isAdmin && typeof updates.role !== 'undefined') {
      return res.status(403).json({ error: 'Only admins can change role' });
    }

    const updated = await updateUserService(id, updates);

    logger.info(`User updated: ${id}`);

    res.status(200).json({ message: 'User updated', data: updated });
  } catch (e) {
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error('Failed to update user', e);
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const idResult = userIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formaValidationError(idResult.error),
      });
    }
    const { id } = idResult.data;

    const requester = req.user;
    if (!requester) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = requester.role === 'admin';
    const isSelf = requester.id === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteUserService(id);

    logger.info(`User deleted: ${id}`);

    res.status(200).json({ message: 'User deleted' });
  } catch (e) {
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error('Failed to delete user', e);
    next(e);
  }
};
