import pool from '../config/db.js';

// Controller for handling order-related logic

// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        // Deserialize the 'items' field from JSON string to an object/array
        const orderData = rows[0];
        try {
            orderData.items = JSON.parse(orderData.items);
        } catch (e) {
            console.error('Failed to parse items JSON for order:', id, e);
            // Fallback to empty array if parsing fails
            orderData.items = []; 
        }

        res.status(200).json(orderData);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get orders by phone number (for customer lookup)
export const getOrdersByPhone = async (req, res) => {
    const { phone } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM orders WHERE phone_number = ? ORDER BY created_at DESC', 
            [phone]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching orders by phone:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get orders by location (for delivery routing)
export const getOrdersByLocation = async (req, res) => {
    const { county, location } = req.query;
    try {
        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];
        
        if (county) {
            query += ' AND county = ?';
            params.push(county);
        }
        
        if (location) {
            query += ' AND location LIKE ?';
            params.push(`%${location}%`);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [rows] = await pool.query(query, params);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching orders by location:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create a new order
export const createOrder = async (req, res) => {
    // The frontend sends an object with customer info and cart items
    const { 
        customer_name, 
        phone_number, 
        county, 
        location, 
        subtotal, 
        shipping_cost = 5.00, 
        total_price, 
        items 
    } = req.body;

    // Validate required fields
    if (!customer_name || !phone_number || !county || !location || !subtotal || !total_price || !items) {
        return res.status(400).json({ 
            message: 'Missing required fields: customer_name, phone_number, county, location, subtotal, total_price, and items.' 
        });
    }

    // Validate that items is an array and not empty
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items must be a non-empty array.' });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    // Validate that total_price matches subtotal + shipping_cost
    // FIX: Removed 'as any' casting which causes SyntaxError in JavaScript
    const calculatedTotal = parseFloat(subtotal) + parseFloat(shipping_cost);
    if (Math.abs(calculatedTotal - parseFloat(total_price)) > 0.01) {
        return res.status(400).json({ message: 'Total price does not match subtotal + shipping cost.' });
    }

    try {
        // The `items` array is stored as a JSON string in the database
        const itemsJson = JSON.stringify(items);
        const [result] = await pool.query(
            `INSERT INTO orders (customer_name, phone_number, county, location, subtotal, shipping_cost, total_price, items) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [customer_name, phone_number, county, location, subtotal, shipping_cost, total_price, itemsJson]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Order placed successfully.',
            order_details: {
                id: result.insertId,
                customer_name,
                phone_number,
                county,
                location,
                total_price,
                status: 'Processing'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        
        // Handle duplicate phone number if you have unique constraints
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'An order with this phone number already exists.' });
        }
        
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update an order's status
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    // Ensure the status is one of the allowed values - NOW INCLUDING 'Cancelled'
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']; 
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        // NOTE: You might want to also update the 'updated_at' field here
        const [result] = await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json({ message: `Order status updated to ${status}.` });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update order details (for customer service)
export const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { customer_name, phone_number, county, location } = req.body;
    
    try {
        const updates = [];
        const params = [];
        
        if (customer_name) {
            updates.push('customer_name = ?');
            params.push(customer_name);
        }
        
        if (phone_number) {
            // Validate phone number format
            const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
            if (!phoneRegex.test(phone_number)) {
                return res.status(400).json({ message: 'Invalid phone number format.' });
            }
            updates.push('phone_number = ?');
            params.push(phone_number);
        }
        
        if (county) {
            updates.push('county = ?');
            params.push(county);
        }
        
        if (location) {
            updates.push('location = ?');
            params.push(location);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }
        
        // Add updated_at timestamp automatically
        updates.push('updated_at = NOW()');
        
        params.push(id);
        const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;
        
        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        res.status(200).json({ message: 'Order updated successfully.' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete an order (admin only)
export const deleteOrder = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_price) as total_revenue,
                AVG(total_price) as average_order_value,
                COUNT(CASE WHEN status = 'Processing' THEN 1 END) as processing_orders,
                COUNT(CASE WHEN status = 'Shipped' THEN 1 END) as shipped_orders,
                COUNT(CASE WHEN status = 'Delivered' THEN 1 END) as delivered_orders,
                COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled_orders
            FROM orders
        `);
        
        res.status(200).json(stats[0]);
    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
