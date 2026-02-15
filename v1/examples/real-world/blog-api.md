# Blog API - Complete Example

A production-ready blog API with authentication, comments, and tags.

## Features

- ✅ User authentication (JWT)
- ✅ Create, read, update, delete posts
- ✅ Comments system
- ✅ Tags and categories
- ✅ Image uploads
- ✅ Pagination
- ✅ Search

## Complete Code

```javascript
import { build, get, post, put, del, use, listen, cache } from 'triva';
import { sign, protect } from '@triva/jwt';
import bcrypt from 'bcrypt';
import multer from '@triva/multer';

// Configure server
await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog'
    }
  },
  throttle: {
    limit: 100,
    window_ms: 60000
  }
});

// File uploads
const upload = multer({ dest: './uploads/' });

// Middleware
use((req, res, next) => {
  res.header('X-API-Version', '1.0.0');
  next();
});

// ==================
// AUTH ENDPOINTS
// ==================

post('/auth/register', async (req, res) => {
  const { email, password, name } = await req.json();
  
  // Validate
  if (!email || !password || !name) {
    return res.status(400).json({ 
      error: 'Email, password, and name required' 
    });
  }
  
  // Check if user exists
  const existing = await cache.get(`user:email:${email}`);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // Create user
  const hash = await bcrypt.hash(password, 10);
  const userId = Date.now().toString();
  
  const user = {
    id: userId,
    email,
    name,
    password: hash,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`user:${userId}`, user);
  await cache.set(`user:email:${email}`, user);
  
  // Generate token
  const token = sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({
    user: { id: userId, email, name },
    token
  });
});

post('/auth/login', async (req, res) => {
  const { email, password } = await req.json();
  
  const user = await cache.get(`user:email:${email}`);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token
  });
});

// ==================
// POST ENDPOINTS
// ==================

// Create post
post('/api/posts', protect(), async (req, res) => {
  const { title, content, tags, category } = await req.json();
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }
  
  const postId = Date.now().toString();
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  
  const blogPost = {
    id: postId,
    slug,
    title,
    content,
    tags: tags || [],
    category: category || 'uncategorized',
    authorId: req.user.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: false,
    views: 0
  };
  
  await cache.set(`post:${postId}`, blogPost);
  await cache.set(`post:slug:${slug}`, blogPost);
  
  res.status(201).json({ post: blogPost });
});

// Get all posts (with pagination)
get('/api/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const keys = await cache.keys('post:*');
  const postKeys = keys.filter(k => !k.includes(':slug:'));
  
  const allPosts = await Promise.all(postKeys.map(k => cache.get(k)));
  const published = allPosts.filter(p => p && p.published);
  
  // Sort by date
  published.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const paginated = published.slice(skip, skip + limit);
  
  res.json({
    posts: paginated,
    pagination: {
      page,
      limit,
      total: published.length,
      pages: Math.ceil(published.length / limit)
    }
  });
});

// Get single post
get('/api/posts/:slug', async (req, res) => {
  const post = await cache.get(`post:slug:${req.params.slug}`);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  // Increment views
  post.views++;
  await cache.set(`post:${post.id}`, post);
  await cache.set(`post:slug:${post.slug}`, post);
  
  res.json({ post });
});

// Update post
put('/api/posts/:id', protect(), async (req, res) => {
  const post = await cache.get(`post:${req.params.id}`);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  // Check ownership
  if (post.authorId !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  const updates = await req.json();
  const updated = {
    ...post,
    ...updates,
    id: post.id,
    authorId: post.authorId,
    updatedAt: new Date().toISOString()
  };
  
  await cache.set(`post:${post.id}`, updated);
  await cache.set(`post:slug:${updated.slug}`, updated);
  
  res.json({ post: updated });
});

// Delete post
del('/api/posts/:id', protect(), async (req, res) => {
  const post = await cache.get(`post:${req.params.id}`);
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  if (post.authorId !== req.user.userId) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  
  await cache.delete(`post:${post.id}`);
  await cache.delete(`post:slug:${post.slug}`);
  
  res.status(204).send();
});

// ==================
// COMMENT ENDPOINTS
// ==================

post('/api/posts/:postId/comments', protect(), async (req, res) => {
  const { content } = await req.json();
  
  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }
  
  const post = await cache.get(`post:${req.params.postId}`);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  const commentId = Date.now().toString();
  const comment = {
    id: commentId,
    postId: req.params.postId,
    authorId: req.user.userId,
    content,
    createdAt: new Date().toISOString()
  };
  
  await cache.set(`comment:${commentId}`, comment);
  await cache.set(`comment:post:${req.params.postId}:${commentId}`, comment);
  
  res.status(201).json({ comment });
});

get('/api/posts/:postId/comments', async (req, res) => {
  const keys = await cache.keys(`comment:post:${req.params.postId}:*`);
  const comments = await Promise.all(keys.map(k => cache.get(k)));
  
  res.json({ comments: comments.filter(Boolean) });
});

// ==================
// SEARCH & FILTER
// ==================

get('/api/posts/search', async (req, res) => {
  const { q, tag, category } = req.query;
  
  const keys = await cache.keys('post:*');
  const postKeys = keys.filter(k => !k.includes(':slug:'));
  const posts = await Promise.all(postKeys.map(k => cache.get(k)));
  
  let filtered = posts.filter(p => p && p.published);
  
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
    );
  }
  
  if (tag) {
    filtered = filtered.filter(p => p.tags.includes(tag));
  }
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  res.json({ posts: filtered });
});

// ==================
// IMAGE UPLOAD
// ==================

post('/api/upload', protect(), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Start server
listen(process.env.PORT || 3000);
console.log('🚀 Blog API running on port', process.env.PORT || 3000);
```

## Environment Variables

```bash
# .env
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-secret-key-here
PORT=3000
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Posts
- `GET /api/posts` - List posts (paginated)
- `GET /api/posts/:slug` - Get single post
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

### Comments
- `GET /api/posts/:postId/comments` - Get comments
- `POST /api/posts/:postId/comments` - Add comment (auth required)

### Search
- `GET /api/posts/search?q=keyword` - Search posts
- `GET /api/posts/search?tag=javascript` - Filter by tag
- `GET /api/posts/search?category=tech` - Filter by category

### Upload
- `POST /api/upload` - Upload image (auth required)

## Usage Examples

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My First Post",
    "content":"This is the content",
    "tags":["javascript","nodejs"],
    "category":"tech"
  }'

# Get posts
curl http://localhost:3000/api/posts?page=1&limit=10

# Search
curl http://localhost:3000/api/posts/search?q=javascript
```

---

**[Back to Examples](../README.md)**
