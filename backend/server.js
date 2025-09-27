import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './src/routes/user.routes.js';
import productRoutes from './src/routes/product.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import messageRoutes from './src/routes/message.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Forever Living Hub API!');
});

app.listen(PORT, () => {
    console.log(`Server is open on http://localhost:${PORT}`);
});
