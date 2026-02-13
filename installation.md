# Installation Guide

Complete installation instructions for Triva across different platforms and use cases.

## Table of Contents

- [System Requirements](#system-requirements)
- [Installing Node.js](#installing-nodejs)
- [Installing Triva](#installing-triva)
- [Database Drivers](#database-drivers)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Platform-Specific Instructions](#platform-specific-instructions)

---

## System Requirements

### Minimum Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher (or yarn v1.22.0+, pnpm v7.0.0+)
- **RAM**: 512 MB minimum, 2 GB recommended
- **Disk Space**: 100 MB minimum

### Supported Platforms

- **Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+, Fedora 35+)
- **macOS** (10.15 Catalina or higher)
- **Windows** (10, 11, Windows Server 2019+)
- **Docker** (Official images available)
- **Cloud Platforms** (AWS, Google Cloud, Azure, Heroku, Vercel, etc.)

### Supported Node.js Versions

| Node.js Version | Support Status |
|-----------------|----------------|
| v22.x | ✅ Fully Supported |
| v20.x (LTS) | ✅ Fully Supported |
| v18.x (LTS) | ✅ Fully Supported |
| v16.x | ⚠️ EOL - Not Recommended |
| v14.x and below | ❌ Not Supported |

---

## Installing Node.js

### Option 1: Using Official Installer (Recommended for Beginners)

**Windows & macOS:**
1. Visit [nodejs.org](https://nodejs.org)
2. Download the LTS version
3. Run the installer
4. Follow the installation wizard

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
npm --version   # Should show v8.0.0 or higher
```

### Option 2: Using Version Manager (Recommended for Developers)

**nvm (Node Version Manager) - Linux/macOS:**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc for Zsh

# Install Node.js LTS
nvm install --lts

# Verify
node --version
```

**nvm-windows - Windows:**

1. Download from [github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)
2. Run `nvm-setup.exe`
3. Install Node.js:

```bash
nvm install lts
nvm use lts
node --version
```

### Option 3: Using Package Managers

**Ubuntu/Debian:**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (Homebrew):**
```bash
brew install node@20
```

**Windows (Chocolatey):**
```bash
choco install nodejs-lts
```

**Fedora:**
```bash
sudo dnf install nodejs
```

---

## Installing Triva

### Method 1: npm (Recommended)

```bash
# Create a new project
mkdir my-triva-app
cd my-triva-app

# Initialize package.json
npm init -y

# Install Triva
npm install triva

# Verify installation
npm list triva
```

### Method 2: yarn

```bash
# Initialize project
yarn init -y

# Install Triva
yarn add triva

# Verify
yarn list triva
```

### Method 3: pnpm

```bash
# Initialize project
pnpm init

# Install Triva
pnpm add triva

# Verify
pnpm list triva
```

### Installing Specific Versions

```bash
# Install latest version
npm install triva@latest

# Install specific version
npm install triva@1.0.0

# Install with exact version (package-lock)
npm install --save-exact triva

# Install beta/rc versions
npm install triva@beta
```

### Global Installation (Not Recommended)

While you can install Triva globally, we recommend project-local installations:

```bash
# Global install (not recommended)
npm install -g triva

# Better: Use npx for CLI tools
npx triva --help
```

---

## Database Drivers

Triva supports multiple databases. Install the driver for your chosen database:

### Built-in Adapters (No Installation Required)

- **Memory** - In-memory cache (built-in)
- **Embedded** - Encrypted JSON file storage (built-in)

### Optional Database Drivers

**SQLite:**
```bash
npm install sqlite3
```

**Better-SQLite3** (Faster, synchronous):
```bash
npm install better-sqlite3
```

**MongoDB:**
```bash
npm install mongodb
```

**Redis:**
```bash
npm install redis
```

**PostgreSQL:**
```bash
npm install pg
```

**MySQL:**
```bash
npm install mysql2
```

**Supabase:**
```bash
npm install @supabase/supabase-js
```

### Installing Multiple Adapters

```bash
# Install all database drivers
npm install sqlite3 better-sqlite3 mongodb redis pg mysql2 @supabase/supabase-js

# Or selectively
npm install mongodb redis  # Just MongoDB and Redis
```

---

## Verification

### Verify Triva Installation

Create `test.js`:

```javascript
import { build, get, listen } from 'triva';

console.log('Triva imported successfully!');

await build({
  env: 'test',
  cache: { type: 'memory' }
});

get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const server = listen(3000);
console.log('✅ Triva is working!');

// Clean up
setTimeout(() => {
  server.close();
  process.exit(0);
}, 1000);
```

Update `package.json`:
```json
{
  "type": "module"
}
```

Run:
```bash
node test.js
```

Expected output:
```
Triva imported successfully!
Triva HTTP server listening on port 3000 (test)
✅ Triva is working!
```

### Verify Database Adapters

**Test MongoDB:**
```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    database: {
      uri: 'mongodb://localhost:27017/test'
    }
  }
});

await cache.set('test', 'value');
const value = await cache.get('test');
console.log('MongoDB:', value === 'value' ? '✅ Working' : '❌ Failed');
```

**Test Redis:**
```javascript
import { build, cache } from 'triva';

await build({
  cache: {
    type: 'redis',
    database: {
      host: 'localhost',
      port: 6379
    }
  }
});

await cache.set('test', 'value');
const value = await cache.get('test');
console.log('Redis:', value === 'value' ? '✅ Working' : '❌ Failed');
```

---

## Troubleshooting

### Common Issues

#### Issue: `Cannot find module 'triva'`

**Cause:** Triva not installed or wrong directory

**Solution:**
```bash
# Ensure you're in the project directory
pwd

# Check if node_modules exists
ls node_modules/

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: `Error: Cannot use import statement outside a module`

**Cause:** ES modules not enabled

**Solution:** Add to `package.json`:
```json
{
  "type": "module"
}
```

Or use `.mjs` extension:
```bash
mv server.js server.mjs
node server.mjs
```

#### Issue: `EACCES: permission denied`

**Cause:** Insufficient permissions

**Solution:**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $USER ~/.npm
sudo chown -R $USER /usr/local/lib/node_modules

# Or use nvm (recommended)
```

#### Issue: `npm ERR! code ELIFECYCLE`

**Cause:** Build script failure

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Database Driver Won't Install (better-sqlite3, etc.)

**Cause:** Missing build tools

**Solution:**

**Windows:**
```bash
npm install --global windows-build-tools
```

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential python3
```

**macOS:**
```bash
xcode-select --install
```

#### Issue: `EADDRINUSE: address already in use`

**Cause:** Port already in use

**Solution:**
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
listen(3001);
```

---

## Platform-Specific Instructions

### Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t my-triva-app .
docker run -p 3000:3000 my-triva-app
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

### AWS Lambda

**Serverless framework:**

```yaml
# serverless.yml
service: triva-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1

functions:
  api:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

**handler.js:**
```javascript
import serverless from 'serverless-http';
import { build, get } from 'triva';

await build({
  env: 'production',
  cache: { type: 'memory' }
});

get('/', (req, res) => {
  res.json({ message: 'Hello from Lambda!' });
});

export const handler = serverless(app);
```

### Vercel

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### Heroku

**Procfile:**
```
web: node server.js
```

**Deploy:**
```bash
# Create Heroku app
heroku create my-triva-app

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

---

## Development Tools

### Recommended Extensions

**VS Code:**
- ESLint
- Prettier
- REST Client
- Thunder Client

**WebStorm/IntelliJ:**
- Node.js plugin (built-in)
- HTTP Client (built-in)

### Dev Dependencies

```bash
# Install development tools
npm install --save-dev \
  eslint \
  prettier \
  nodemon \
  dotenv

# Or with one command
npm install -D eslint prettier nodemon dotenv
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

## Next Steps

After successful installation:

1. **[Getting Started](GETTING-STARTED.md)** - Build your first app
2. **[Configuration](guides/configuration.md)** - Learn all config options
3. **[Database Setup](database-and-cache/overview.md)** - Connect your database
4. **[Deployment](guides/deployment.md)** - Deploy to production

---

## Getting Help

### Installation Issues

If you encounter installation problems:

1. Check [GitHub Issues](https://github.com/trivajs/triva/issues)
2. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/triva)
3. Join our [Discord](https://discord.gg/triva)
4. Email: support@trivajs.com

### Reporting Bugs

Found a bug? [Open an issue](https://github.com/trivajs/triva/issues/new) with:

- Node.js version (`node --version`)
- npm version (`npm --version`)
- Operating system
- Error message (full stack trace)
- Steps to reproduce
