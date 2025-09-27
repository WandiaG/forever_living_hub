import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  getOrdersByPhone,
  getOrdersByLocation,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from "../controllers/order.controller.js";

const router = Router();

// Define order API routes

// GET routes
router.get("/", getAllOrders); // Get all orders
router.get("/stats", getOrderStats); // Get order statistics (must be before /:id)
router.get("/phone/:phone", getOrdersByPhone); // Get orders by phone number
router.get("/location", getOrdersByLocation); // Get orders by location (query params: county, location)
router.get("/:id", getOrderById); // Get single order by ID

// POST routes
router.post("/", createOrder); // Create new order

// PUT routes
router.patch("/:id", updateOrderStatus); // Update order status only
router.put("/:id", updateOrder); // Update order details (customer info)

// DELETE routes
router.delete("/:id", deleteOrder); // Delete order (admin only)

export default router;
