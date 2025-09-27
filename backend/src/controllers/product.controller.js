import pool from '../config/db.js';

// Controller for handling product-related logic

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new product
export const createProduct = async (req, res) => {
    // The 'benefit' field has been added to the request body
    const { name, description, benefit, price, imageUrl } = req.body;
    if (!name || !price || !imageUrl) {
        return res.status(400).json({ message: 'Missing required fields: name, price, and imageUrl.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, benefit, price, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [name, description, benefit, price, imageUrl]
        );
        res.status(201).json({ id: result.insertId, message: 'Product created successfully.' });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update an existing product
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    // The 'benefit' field has been added to the request body
    const { name, description, benefit, price, imageUrl } = req.body;
    if (!name || !price || !imageUrl) {
        return res.status(400).json({ message: 'Missing required fields: name, price, and imageUrl.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE products SET name = ?, description = ?, benefit = ?, price = ?, imageUrl = ? WHERE id = ?',
            [name, description, benefit, price, imageUrl, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product updated successfully.' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a product
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
