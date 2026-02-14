# Deployment Guide

Production deployment strategies for Triva applications.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Platform Guides](#platform-guides)
- [Docker Deployment](#docker-deployment)
- [Production Checklist](#production-checklist)

---

## Prerequisites

### Before Deploying

- ✅ All tests passing
- ✅ Environment variables configured
- ✅ Database/cache setup
- ✅ SSL certificates (for HTTPS)
- ✅ Error handling implemented
- ✅ Logging configured
- ✅ Rate limiting enabled

---

## Environment Setup

### Environment Variables

```bash
# .env
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://username:password@host:27017/dbname
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# SSL (if using HTTPS)
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
```

### Production Configuration

```javascript
import { build, listen } from 'triva';
import fs from 'fs';

await build({
  env: 'production',
  
  protocol: 'https',
  ssl: {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  },
  
  cache: {
    type: 'redis',
    database: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD
    }
  },
  
  throttle: {
    limit: 1000,
    window_ms: 60000,
    ban_threshold: 10
  }
});

listen(process.env.PORT || 3000);
```

---

## Platform Guides

### Heroku

**1. Install Heroku CLI:**
```bash
npm install -g heroku
heroku login
```

**2. Create app:**
```bash
heroku create my-triva-app
```

**3. Configure:**
```bash
heroku config:set NODE_ENV=production
heroku config:set REDIS_URL=redis://...
```

**4. Deploy:**
```bash
git push heroku main
```

**5. Scale:**
```bash
heroku ps:scale web=1
```

**Procfile:**
```
web: node server.js
```

---

### AWS (EC2)

**1. Launch EC2 instance** (Ubuntu 22.04)

**2. Connect via SSH:**
```bash
ssh -i key.pem ubuntu@ec2-ip-address.compute.amazonaws.com
```

**3. Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**4. Install PM2:**
```bash
sudo npm install -g pm2
```

**5. Deploy app:**
```bash
git clone https://github.com/user/repo.git
cd repo
npm install
pm2 start server.js --name triva-app
pm2 save
pm2 startup
```

**6. Configure nginx:**
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### Vercel

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Deploy:**
```bash
vercel --prod
```

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/server.js" }
  ]
}
```

---

### Digital Ocean

**1. Create Droplet** (Ubuntu 22.04)

**2. SSH into droplet:**
```bash
ssh root@your-droplet-ip
```

**3. Setup:**
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Deploy app
cd /var/www
git clone your-repo
cd your-repo
npm install
pm2 start server.js
pm2 startup
pm2 save
```

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_HOST=redis
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  mongo-data:
```

### Build & Run

```bash
# Build
docker build -t my-triva-app .

# Run
docker run -p 3000:3000 my-triva-app

# With docker-compose
docker-compose up -d
```

---

## Production Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Secrets not in code

### Performance
- [ ] Redis/MongoDB configured
- [ ] Caching enabled
- [ ] Gzip compression enabled
- [ ] Static assets optimized
- [ ] Database indexes created

### Monitoring
- [ ] Health check endpoint
- [ ] Error tracking enabled
- [ ] Logging configured
- [ ] Metrics collection setup
- [ ] Alerting configured

### Reliability
- [ ] Process manager (PM2)
- [ ] Auto-restart on crash
- [ ] Database backups
- [ ] Redundancy/failover
- [ ] Load balancing (if needed)

---

**Next:** [Performance Guide](performance.md) | [Monitoring](monitoring.md)
