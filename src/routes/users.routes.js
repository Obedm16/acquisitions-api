import express from 'express';
import { fetchAllUsers, getUserByIdController, updateUser, deleteUser } from '#controllers/users.controller.js';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', getUserByIdController);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
