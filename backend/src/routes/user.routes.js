import { Router } from 'express';
import { getAllUsers, createUser, loginUser } from '../controllers/user.controller.js';

const router = Router();

// Define user API routes
router.get('/', getAllUsers);
router.post('/register', createUser);
router.post('/login', loginUser);

export default router;
