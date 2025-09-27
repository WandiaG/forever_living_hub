import pool from '../config/db.js';

// Controller for handling message-related logic

// Get all messages
export const getAllMessages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a single message by ID
// Node.js Controller: getMessageById (Confirm this logic in your file)

export const getMessageById = async (req, res) => {
    const { id } = req.params; // Extracts '2' from the URL

    try {
        // 💡 CRITICAL: The query uses 'WHERE id = ?' and the parameter is passed as an array [id]
        const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]); 
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        
        // Return the first (and only) message object
        res.status(200).json(rows[0]); 
        
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get messages by status
export const getMessagesByStatus = async (req, res) => {
    const { replied } = req.query; // ?replied=true or ?replied=false
    
    try {
        let query = 'SELECT * FROM messages';
        const params = [];
        
        if (replied !== undefined) {
            query += ' WHERE is_replied = ?';
            params.push(replied === 'true' ? 1 : 0);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching messages by status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Search messages
export const searchMessages = async (req, res) => {
    const { sender, subject, email } = req.query;
    
    try {
        let query = 'SELECT * FROM messages WHERE 1=1';
        const params = [];
        
        if (sender) {
            query += ' AND sender LIKE ?';
            params.push(`%${sender}%`);
        }
        
        if (subject) {
            query += ' AND subject LIKE ?';
            params.push(`%${subject}%`);
        }
        
        if (email) {
            query += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new message
export const createMessage = async (req, res) => {
    const { sender, phone, email, subject, message } = req.body;
    
    // Validate required fields
    if (!sender || !subject || !message) {
        return res.status(400).json({ 
            message: 'Missing required fields: sender, subject, and message are required.' 
        });
    }

    // Validate that either phone or email is provided
    if (!phone && !email) {
        return res.status(400).json({ 
            message: 'Either phone number or email must be provided.' 
        });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate phone format if provided (basic validation)
    if (phone && !/^[\d\s\-\(\)]{10,15}$/.test(phone.toString())) {
        return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO messages (sender, phone, email, subject, message) VALUES (?, ?, ?, ?, ?)',
            [sender, phone || null, email || null, subject, message]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Message sent successfully.',
            details: {
                id: result.insertId,
                sender,
                subject,
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Mark message as replied
export const markMessageAsReplied = async (req, res) => {
    const { id } = req.params;
    const { is_replied = true } = req.body;
    
    try {
        const [result] = await pool.query(
            'UPDATE messages SET is_replied = ? WHERE id = ?', 
            [is_replied, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        
        res.status(200).json({ 
            message: `Message marked as ${is_replied ? 'replied' : 'not replied'}.` 
        });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a message (admin only)
export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Message not found.' });
        }
        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get message statistics
export const getMessageStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_messages,
                COUNT(CASE WHEN is_replied = 1 THEN 1 END) as replied_messages,
                COUNT(CASE WHEN is_replied = 0 THEN 1 END) as unread_messages,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as messages_today,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as messages_this_week
            FROM messages
        `);
        
        res.status(200).json(stats[0]);
    } catch (error) {
        console.error('Error fetching message statistics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};