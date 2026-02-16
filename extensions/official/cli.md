# @triva/cli

Command-line interface for Triva applications.

[![npm version](https://img.shields.io/npm/v/@triva/cli.svg)](https://npmjs.com/package/@triva/cli)
[![License](https://img.shields.io/npm/l/@triva/cli.svg)](LICENSE)

## Features

✅ **Project Generation** - Create new Triva projects  
✅ **Templates** - Multiple project templates  
✅ **Development Server** - Hot reload and live updates  
✅ **Build Tools** - Production builds  
✅ **Extension Management** - Install and manage extensions  
✅ **Database Migrations** - Schema management  

## Installation

### Global Installation (Recommended)

```bash
npm install -g @triva/cli
```

### Project Installation

```bash
npm install --save-dev @triva/cli
```

## Commands

### create

Create a new Triva project.

```bash
triva create my-app
```

**Options:**
- `--template <name>` - Project template (basic, api, fullstack)
- `--database <type>` - Database adapter (memory, redis, mongodb)
- `--no-install` - Skip npm install

**Examples:**
```bash
# Basic project
triva create my-app

# API project with MongoDB
triva create my-api --template api --database mongodb

# Fullstack with Redis
triva create my-fullstack --template fullstack --database redis

# Create without installing dependencies
triva create my-app --no-install
```

### dev

Start development server with hot reload.

```bash
triva dev
```

**Options:**
- `--port <number>` - Port number (default: 3000)
- `--host <address>` - Host address (default: localhost)
- `--open` - Open browser automatically

**Examples:**
```bash
# Default port
triva dev

# Custom port
triva dev --port 8080

# Open browser
triva dev --open

# Custom host and port
triva dev --host 0.0.0.0 --port 3000
```

### build

Build project for production.

```bash
triva build
```

**Options:**
- `--output <dir>` - Output directory (default: dist)
- `--minify` - Minify code
- `--source-maps` - Generate source maps

**Examples:**
```bash
# Basic build
triva build

# Build with minification
triva build --minify

# Custom output directory
triva build --output ./build
```

### start

Start production server.

```bash
triva start
```

**Options:**
- `--port <number>` - Port number (default: 3000)
- `--env <file>` - Environment file path

**Examples:**
```bash
# Default
triva start

# Custom port
triva start --port 8080

# Custom env file
triva start --env .env.production
```

### ext

Manage extensions.

```bash
# List installed extensions
triva ext list

# Search extensions
triva ext search <query>

# Install extension
triva ext install <name>

# Remove extension
triva ext remove <name>

# Update extensions
triva ext update
```

**Examples:**
```bash
# List extensions
triva ext list

# Search for auth extensions
triva ext search auth

# Install JWT extension
triva ext install @triva/jwt

# Remove extension
triva ext remove @triva/jwt

# Update all extensions
triva ext update
```

### migrate

Database migration commands.

```bash
# Create migration
triva migrate create <name>

# Run migrations
triva migrate up

# Rollback migration
triva migrate down

# Migration status
triva migrate status
```

**Examples:**
```bash
# Create migration
triva migrate create add-users-table

# Run all pending migrations
triva migrate up

# Rollback last migration
triva migrate down

# Check migration status
triva migrate status
```

### generate

Generate code scaffolding.

```bash
# Generate route
triva generate route <name>

# Generate middleware
triva generate middleware <name>

# Generate model
triva generate model <name>

# Generate extension
triva generate extension <name>
```

**Examples:**
```bash
# Generate route
triva generate route users

# Generate middleware
triva generate middleware auth

# Generate model
triva generate model User

# Generate extension
triva generate extension my-extension
```

## Project Templates

### basic

Simple Triva application with minimal setup.

**Includes:**
- Basic routing
- Memory cache
- Example routes
- README

```bash
triva create my-app --template basic
```

### api

REST API template with best practices.

**Includes:**
- RESTful routes
- Database adapter
- Authentication setup
- API documentation
- Error handling

```bash
triva create my-api --template api --database mongodb
```

### fullstack

Full-stack application with frontend.

**Includes:**
- Backend API
- Frontend integration
- Database adapter
- Authentication
- Static file serving

```bash
triva create my-fullstack --template fullstack
```

## Configuration

### triva.config.js

```javascript
export default {
  // Server configuration
  server: {
    port: 3000,
    host: 'localhost'
  },
  
  // Build configuration
  build: {
    output: 'dist',
    minify: true,
    sourceMaps: true
  },
  
  // Database configuration
  database: {
    type: 'mongodb',
    uri: process.env.MONGODB_URI
  },
  
  // Extensions
  extensions: [
    '@triva/cors',
    '@triva/jwt'
  ]
};
```

## Development Workflow

### 1. Create Project

```bash
triva create my-app
cd my-app
```

### 2. Start Development

```bash
triva dev
```

### 3. Build for Production

```bash
triva build
```

### 4. Deploy

```bash
triva start
```

## Environment Variables

The CLI respects these environment variables:

- `PORT` - Server port
- `NODE_ENV` - Environment (development, production)
- `TRIVA_CONFIG` - Config file path
- `JWT_SECRET` - JWT secret key
- Database connection strings (varies by adapter)

## Scripts Integration

Add to package.json:

```json
{
  "scripts": {
    "dev": "triva dev",
    "build": "triva build",
    "start": "triva start",
    "migrate": "triva migrate up"
  }
}
```

## Hot Reload

The dev server watches for file changes:

**Watched files:**
- `*.js` - JavaScript files
- `routes/` - Route definitions
- `middleware/` - Middleware files
- `.env` - Environment variables

**Auto-restart triggers:**
- Code changes
- New files
- Deleted files
- Environment changes

## Build Process

Production build optimization:

1. **Bundle** - Combine modules
2. **Minify** - Reduce file size
3. **Tree-shake** - Remove unused code
4. **Optimize** - Performance improvements

**Build output:**
```
dist/
├── index.js          # Main entry
├── routes/           # Bundled routes
├── middleware/       # Bundled middleware
└── package.json      # Production dependencies
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
triva dev --port 8080
```

### Module Not Found

```bash
# Reinstall dependencies
npm install

# Clear cache
npm cache clean --force
npm install
```

### Build Fails

```bash
# Check for errors
triva build --verbose

# Clear build cache
rm -rf dist
triva build
```

## CLI Plugins

Extend CLI with custom commands:

```javascript
// triva-plugin-deploy.js
export default {
  name: 'deploy',
  description: 'Deploy to production',
  
  async run(args) {
    console.log('Deploying...');
    // Your deployment logic
  }
};
```

**Register plugin:**
```javascript
// triva.config.js
import deployPlugin from './triva-plugin-deploy.js';

export default {
  plugins: [deployPlugin]
};
```

**Use plugin:**
```bash
triva deploy
```

## Examples

### Complete Development Workflow

```bash
# 1. Create new project
triva create my-api --template api --database mongodb

# 2. Navigate to project
cd my-api

# 3. Install extensions
triva ext install @triva/jwt
triva ext install @triva/cors

# 4. Generate route
triva generate route users

# 5. Start development
triva dev --open

# 6. Create migration
triva migrate create add-users-table

# 7. Run migrations
triva migrate up

# 8. Build for production
triva build --minify

# 9. Start production server
triva start --port 8080
```

## Version Management

```bash
# Check CLI version
triva --version

# Check for updates
triva update-check

# Update CLI
npm update -g @triva/cli
```

## Getting Help

```bash
# General help
triva --help

# Command help
triva create --help
triva dev --help
triva build --help
```

## License

MIT © Triva Team
