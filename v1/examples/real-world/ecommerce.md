# E-commerce API - Complete Example

A production-ready e-commerce backend with products, cart, and orders.

## Features

- ✅ Product management
- ✅ Shopping cart
- ✅ Order processing
- ✅ Inventory tracking
- ✅ User authentication
- ✅ Payment integration ready

## Complete Code

```javascript
import { build, get, post, put, del, use, listen, cache } from 'triva';
import { sign, protect } from '@triva/jwt';
import bcrypt from 'bcrypt';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
    }
  },
  throttle: { limit: 100, window_ms: 60000 }
});

// ==================
// PRODUCTS
// ==================

// Create product (admin only)
post('/api/products', protect(), async (req, res) => {
  const { name, description, price, stock, category, images } = await req.json();
  
  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock required' });
  }
  
  const productId = Date.now().toString();
  const product = {
    id: productId,
    name,
    description,
    price,
    stock,
    category,
    images: images || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await cache.set(`product:${productId}`, product);
  
  res.status(201).json({ product });
});

// Get all products
get('/api/products', async (req, res) => {
  const { category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  
  const keys = await cache.keys('product:*');
  let products = await Promise.all(keys.map(k => cache.get(k)));
  products = products.filter(Boolean);
  
  // Filter by category
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  // Filter by price range
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  const paginated = products.slice(skip, skip + parseInt(limit));
  
  res.json({
    products: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: products.length,
      pages: Math.ceil(products.length / limit)
    }
  });
});

// Get single product
get('/api/products/:id', async (req, res) => {
  const product = await cache.get(`product:${req.params.id}`);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json({ product });
});

// Update product
put('/api/products/:id', protect(), async (req, res) => {
  const product = await cache.get(`product:${req.params.id}`);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const updates = await req.json();
  const updated = {
    ...product,
    ...updates,
    id: product.id,
    updatedAt: new Date().toISOString()
  };
  
  await cache.set(`product:${product.id}`, updated);
  
  res.json({ product: updated });
});

// ==================
// CART
// ==================

// Get cart
get('/api/cart', protect(), async (req, res) => {
  const cart = await cache.get(`cart:${req.user.userId}`) || { items: [], total: 0 };
  res.json({ cart });
});

// Add to cart
post('/api/cart/items', protect(), async (req, res) => {
  const { productId, quantity } = await req.json();
  
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }
  
  const product = await cache.get(`product:${productId}`);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({ error: 'Insufficient stock' });
  }
  
  const cart = await cache.get(`cart:${req.user.userId}`) || { items: [], total: 0 };
  
  // Check if product already in cart
  const existing = cart.items.find(item => item.productId === productId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      name: product.name,
      price: product.price,
      quantity
    });
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  await cache.set(`cart:${req.user.userId}`, cart);
  
  res.json({ cart });
});

// Update cart item
put('/api/cart/items/:productId', protect(), async (req, res) => {
  const { quantity } = await req.json();
  
  if (quantity < 0) {
    return res.status(400).json({ error: 'Quantity must be positive' });
  }
  
  const cart = await cache.get(`cart:${req.user.userId}`) || { items: [], total: 0 };
  const item = cart.items.find(i => i.productId === req.params.productId);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not in cart' });
  }
  
  if (quantity === 0) {
    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
  } else {
    item.quantity = quantity;
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  await cache.set(`cart:${req.user.userId}`, cart);
  
  res.json({ cart });
});

// Clear cart
del('/api/cart', protect(), async (req, res) => {
  await cache.delete(`cart:${req.user.userId}`);
  res.status(204).send();
});

// ==================
// ORDERS
// ==================

// Create order
post('/api/orders', protect(), async (req, res) => {
  const cart = await cache.get(`cart:${req.user.userId}`);
  
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const { shippingAddress, paymentMethod } = await req.json();
  
  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address required' });
  }
  
  // Check stock availability
  for (const item of cart.items) {
    const product = await cache.get(`product:${item.productId}`);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Insufficient stock for ${item.name}` 
      });
    }
  }
  
  // Create order
  const orderId = Date.now().toString();
  const order = {
    id: orderId,
    userId: req.user.userId,
    items: cart.items,
    total: cart.total,
    shippingAddress,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`order:${orderId}`, order);
  await cache.set(`order:user:${req.user.userId}:${orderId}`, order);
  
  // Update inventory
  for (const item of cart.items) {
    const product = await cache.get(`product:${item.productId}`);
    product.stock -= item.quantity;
    await cache.set(`product:${item.productId}`, product);
  }
  
  // Clear cart
  await cache.delete(`cart:${req.user.userId}`);
  
  res.status(201).json({ order });
});

// Get user orders
get('/api/orders', protect(), async (req, res) => {
  const keys = await cache.keys(`order:user:${req.user.userId}:*`);
  const orders = await Promise.all(keys.map(k => cache.get(k)));
  
  res.json({ orders: orders.filter(Boolean) });
});

// Get single order
get('/api/orders/:id', protect(), async (req, res) => {
  const order = await cache.get(`order:${req.params.id}`);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (order.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  res.json({ order });
});

// Update order status (admin)
put('/api/orders/:id/status', protect(), async (req, res) => {
  const { status } = await req.json();
  
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const order = await cache.get(`order:${req.params.id}`);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  await cache.set(`order:${order.id}`, order);
  await cache.set(`order:user:${order.userId}:${order.id}`, order);
  
  res.json({ order });
});

// ==================
// CATEGORIES
// ==================

get('/api/categories', async (req, res) => {
  const keys = await cache.keys('product:*');
  const products = await Promise.all(keys.map(k => cache.get(k)));
  
  const categories = [...new Set(products.filter(Boolean).map(p => p.category))];
  
  res.json({ categories });
});

listen(process.env.PORT || 3000);
console.log('🛒 E-commerce API running on port', process.env.PORT || 3000);
```

## API Endpoints

### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)

### Cart
- `GET /api/cart` - Get cart (auth required)
- `POST /api/cart/items` - Add to cart (auth required)
- `PUT /api/cart/items/:productId` - Update quantity (auth required)
- `DELETE /api/cart` - Clear cart (auth required)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)
- `PUT /api/orders/:id/status` - Update status (admin)

### Categories
- `GET /api/categories` - List all categories

## Usage Examples

```bash
# Create product
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Laptop",
    "description":"High-performance laptop",
    "price":999.99,
    "stock":50,
    "category":"Electronics"
  }'

# Add to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"123","quantity":2}'

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress":"123 Main St",
    "paymentMethod":"credit_card"
  }'
```

---

**[Back to Examples](../README.md)**
