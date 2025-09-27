// User interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Product interfaces
export interface Product {
  id: number;
  name: string;
  description: string | null;
  benefit: string | null;
  price: number;
  imageUrl: string;
  created_at: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  benefit?: string;
  price: number;
  imageUrl: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  benefit?: string;
  price?: number;
  imageUrl?: string;
}

// Order interfaces
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  product_id?: number;
}

export interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  county: string;
  location: string;
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  customer_name: string;
  phone_number: string;
  county: string;
  location: string;
  subtotal: number;
  shipping_cost?: number;
  total_price: number;
  items: OrderItem[];
}

export interface UpdateOrderStatusRequest {
  status: 'Processing' | 'Shipped' | 'Delivered';
}

export interface UpdateOrderRequest {
  customer_name?: string;
  phone_number?: string;
  county?: string;
  location?: string;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
}

export interface OrderLocationFilter {
  county?: string;
  location?: string;
}

// Message interfaces
export interface MessageList {
  id: number;
  sender: string;
  phone: number | null;
  email: string | null;
  subject: string;
  message: string;
  is_replied: number;
  created_at: string;
}

export interface CreateMessageRequest {
  sender: string;
  phone?: number;
  email?: string;
  subject: string;
  message: string;
}

export interface UpdateMessageRequest {
  is_replied?: boolean;
}

export interface MessageFilter {
  is_replied?: boolean;
  sender?: string;
  subject?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error interfaces
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}

// Dashboard/Analytics interfaces
export interface DashboardStats {
  orders: OrderStats;
  products: {
    total_products: number;
    out_of_stock: number;
  };
  messages: {
    total_messages: number;
    unread_messages: number;
  };
  revenue: {
    today: number;
    this_week: number;
    this_month: number;
  };
}

// Shopping Cart interfaces (for frontend)
export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description?: string;
  benefit?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping_cost: number;
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

// Customer interfaces
export interface CustomerInfo {
  customer_name: string;
  phone_number: string;
  county: string;
  location: string;
}

// Extended customer interface for full profile
export interface Customer extends CustomerInfo {
  id?: number;
  email?: string;
  created_at?: string;
  updated_at?: string;
  total_orders?: number;
  total_spent?: number;
}

// Cart management interfaces
export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  product_id: number;
  quantity: number;
}

export interface CartSummary {
  item_count: number;
  subtotal: number;
  shipping_cost: number;
  total_price: number;
}

// Checkout interfaces
export interface CheckoutData {
  customer_info: CustomerInfo;
  cart: Cart;
  payment_method?: string;
  delivery_instructions?: string;
}

export interface OrderConfirmation {
  order_id: number;
  order_number: string;
  status: string;
  estimated_delivery: string;
  customer_info: CustomerInfo;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
}

// Search and Filter interfaces
export interface ProductFilter {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  availability?: 'in_stock' | 'out_of_stock';
}

export interface OrderFilter {
  status?: 'Processing' | 'Shipped' | 'Delivered';
  customer_name?: string;
  phone_number?: string;
  county?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  min_total?: number;
  max_total?: number;
}

// Inventory interfaces
export interface InventoryItem {
  product_id: number;
  quantity_available: number;
  quantity_reserved: number;
  reorder_level: number;
  last_updated: string;
}

export interface StockAlert {
  product_id: number;
  product_name: string;
  current_stock: number;
  reorder_level: number;
  status: 'low_stock' | 'out_of_stock' | 'reorder_required';
}

// Notification interfaces
export interface Notification {
  id: number;
  type: 'order' | 'stock' | 'system' | 'customer';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface CreateNotificationRequest {
  type: 'order' | 'stock' | 'system' | 'customer';
  title: string;
  message: string;
  data?: any;
}

// Shipping interfaces
export interface ShippingZone {
  id: number;
  name: string;
  counties: string[];
  base_cost: number;
  per_kg_cost?: number;
  estimated_days: number;
}

export interface ShippingCalculation {
  zone: string;
  cost: number;
  estimated_delivery: string;
  method: string;
}

// Payment interfaces
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';
  is_active: boolean;
  instructions?: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_ref?: string;
  created_at: string;
  updated_at: string;
}

// Utility types
export type OrderStatus = Order['status'];
export type CreateOrderResponse = { 
  id: number; 
  message: string; 
  order_details: Partial<Order>; 
  order_number: string;
};
export type UserWithoutPassword = Omit<User, 'password'>;
export type ProductSummary = Pick<Product, 'id' | 'name' | 'price' | 'imageUrl'>;
export type OrderSummary = Pick<Order, 'id' | 'customer_name' | 'total_price' | 'status' | 'created_at'>;
export type MessageSummary = Pick<MessageList, 'id' | 'sender' | 'subject' | 'is_replied' | 'created_at'>;
export type CartItemSummary = Pick<CartItem, 'product_id' | 'name' | 'quantity' | 'price'>;
export type CustomerSummary = Pick<Customer, 'customer_name' | 'phone_number' | 'county' | 'location'>;

// Event interfaces for real-time updates
export interface OrderStatusUpdate {
  order_id: number;
  old_status: OrderStatus;
  new_status: OrderStatus;
  updated_at: string;
  notes?: string;
}

export interface InventoryUpdate {
  product_id: number;
  old_quantity: number;
  new_quantity: number;
  change_reason: string;
  updated_at: string;
}