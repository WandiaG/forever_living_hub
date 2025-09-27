import { Router } from 'express';
import { 
    getAllMessages, 
    getMessageById, 
    getMessagesByStatus,
    searchMessages,
    createMessage, 
    markMessageAsReplied,
    deleteMessage,
    getMessageStats
} from '../controllers/message.controller.js';

const router = Router();

// Define message API routes

// GET routes
router.get('/', getAllMessages);                    // Get all messages
router.get('/stats', getMessageStats);             // Get message statistics (must be before /:id)
router.get('/status', getMessagesByStatus);        // Get messages by replied status (?replied=true/false)
router.get('/search', searchMessages);             // Search messages by sender, subject, or email
router.get('/:id', getMessageById);               // Get single message by ID

// POST routes
router.post('/', createMessage);                   // Create new message (contact form submission)

// PUT routes
router.put('/:id/reply', markMessageAsReplied);   // Mark message as replied/unread

// DELETE routes
router.delete('/:id', deleteMessage);             // Delete message (admin only)

export default router;