import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Controller for handling user-related logic and authentication

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, email FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new user (admin)
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }

    try {
        // Hash the password before saving it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        res.status(201).json({ id: result.insertId, username, email, message: 'User created successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// User login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT id, username, email, password FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // In a real application, you would generate a JWT token here
            res.status(200).json({ id: user.id, username: user.username, email: user.email, message: 'Login successful.' });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
