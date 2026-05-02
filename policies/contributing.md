# Contributing to Triva

Thank you for your interest in contributing to Triva! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE-OF-CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports:

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Verify the bug** exists in a clean environment

**Good bug reports** include:

* Clear, descriptive title
* Steps to reproduce
* Expected vs actual behavior
* Screenshots (if applicable)
* Environment details (Node.js version, OS, etc.)
* Minimal code example
* Stack trace (if applicable)

**Template:**

```markdown
### Bug Description
A clear description of the bug.

### Steps to Reproduce
1. Install Triva
2. Run this code: `...`
3. Observe error

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- Node.js version: 20.10.0
- Triva version: 1.0.0
- OS: Ubuntu 22.04
- Database: MongoDB 7.0

### Additional Context
Any other relevant information
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

1. **Search existing issues** first
2. **Explain the use case** clearly
3. **Describe the solution** you envision
4. **Consider alternatives** you've thought of

**Template:**

```markdown
### Feature Request

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information.
```

### First-Time Contributors

New to open source? Welcome! Look for issues labeled:

* `good first issue` - Simple, well-defined tasks
* `help wanted` - We need contributors for these
* `documentation` - Documentation improvements

## Development Setup

### Prerequisites

* Node.js 18+
* npm 8+
* Git

### Fork and Clone

```bash
# Fork the repo on GitHub, then:

git clone https://github.com/YOUR_USERNAME/triva.git
cd triva

# Add upstream remote
git remote add upstream https://github.com/trivajs/triva.git
```

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Specific adapter tests
npm run test:adapter:mongodb
npm run test:adapter:redis
```

### Development Workflow

```bash
# Create a branch
git checkout -b feature/my-feature

# Make your changes
# ... code ...

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Commit
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature
```

## Pull Request Process

### Before Submitting

✅ **Tests pass** - All tests must pass  
✅ **Code formatted** - Run `npm run format`  
✅ **Linter happy** - Run `npm run lint`  
✅ **Documentation updated** - If needed  
✅ **Changelog updated** - For user-facing changes  

### PR Guidelines

**Good PRs:**

* Solve one problem
* Have clear descriptions
* Include tests
* Update docs
* Follow coding standards
* Have meaningful commits

**PR Template:**

```markdown
### Description
What does this PR do?

### Motivation
Why is this change needed?

### Changes
- Added X
- Fixed Y
- Updated Z

### Testing
How was this tested?

### Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Code formatted
- [ ] All tests pass
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

* `feat:` - New feature
* `fix:` - Bug fix
* `docs:` - Documentation only
* `style:` - Code style (formatting, etc.)
* `refactor:` - Code restructuring
* `perf:` - Performance improvement
* `test:` - Adding/updating tests
* `chore:` - Maintenance tasks

**Examples:**

```bash
feat: add Redis adapter
fix: resolve memory leak in cache
docs: update installation guide
refactor: simplify routing logic
test: add throttle middleware tests
```

### Review Process

1. **Automated Checks** - CI/CD runs tests
2. **Code Review** - Maintainer reviews code
3. **Discussion** - Address feedback
4. **Approval** - Maintainer approves
5. **Merge** - Maintainer merges PR

**Review Timeline:**

* First response: Within 3-7 days
* Full review: Within 14 days
* Merge: After approval

## Coding Standards

### Style Guide

We use ESLint and Prettier:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### JavaScript Style

**DO:**

```javascript
// Use const/let, not var
const name = 'Triva';
let count = 0;

// Use async/await
async function fetchData() {
  const data = await db.find();
  return data;
}

// Use destructuring
const { name, age } = user;

// Use template literals
const message = `Hello, ${name}!`;

// Use arrow functions
const double = (x) => x * 2;

// Early returns
function validate(data) {
  if (!data) return false;
  if (!data.name) return false;
  return true;
}
```

**DON'T:**

```javascript
// Don't use var
var name = 'Triva';  // ❌

// Don't use callbacks when async/await works
db.find((err, data) => {  // ❌
  if (err) throw err;
});

// Don't use concatenation
const message = 'Hello, ' + name + '!';  // ❌

// Don't use function expressions unnecessarily
const double = function(x) { return x * 2; };  // ❌
```

### File Organization

```
lib/
├── core/          # Core functionality
│   ├── server.js
│   ├── router.js
│   └── ...
├── database/      # Database adapters
│   ├── mongodb.js
│   ├── redis.js
│   └── ...
├── middleware/    # Middleware
│   ├── throttle.js
│   └── ...
└── utils/         # Utilities
    └── ...
```

### Documentation

**JSDoc Comments:**

```javascript
/**
 * Creates a new user.
 * 
 * @param {Object} data - User data
 * @param {string} data.name - User's name
 * @param {string} data.email - User's email
 * @returns {Promise<User>} Created user
 * @throws {ValidationError} If data is invalid
 * 
 * @example
 * const user = await createUser({
 *   name: 'John',
 *   email: 'john@example.com'
 * });
 */
async function createUser(data) {
  // Implementation
}
```

## Testing

### Writing Tests

**Test Structure:**

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

**Test Coverage:**

* Unit tests for all functions
* Integration tests for features
* Edge cases and error conditions
* Performance-sensitive code

**Running Specific Tests:**

```bash
# Run one test file
npm test -- test/unit/cache.test.js

# Run tests matching pattern
npm test -- --grep "throttle"

# Run with coverage
npm run test:coverage
```

## Documentation

### Types of Documentation

1. **Code Comments** - Explain WHY, not WHAT
2. **JSDoc** - API documentation
3. **README** - Project overview
4. **Guides** - How-to documentation
5. **Examples** - Working code samples

### Writing Good Docs

**DO:**

* Use clear, simple language
* Include code examples
* Show both basic and advanced usage
* Link to related documentation
* Keep it up to date

**DON'T:**

* Assume prior knowledge
* Use jargon without explanation
* Leave out error handling
* Forget to update when code changes

### Documentation Structure

```
docs/
├── GETTING-STARTED.md
├── INSTALLATION.md
├── guides/
│   ├── routing.md
│   ├── middleware.md
│   └── ...
├── database-and-cache/
│   ├── overview.md
│   └── ...
└── api-reference/
    └── ...
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

* **MAJOR** (1.0.0) - Breaking changes
* **MINOR** (0.1.0) - New features
* **PATCH** (0.0.1) - Bug fixes

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push --tags`
5. GitHub Action creates release

## Community

### Where to Get Help

* **GitHub Discussions** - Questions and ideas
* **Discord** - Real-time chat
* **Stack Overflow** - Tag with `triva`
* **Twitter** - @trivajs

### Recognition

Contributors are recognized in:

* README.md contributors section
* Release notes
* Documentation credits
* Annual contributor spotlight

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to ask! Contact:

* **Email:** contact@trivajs.com
* **Discussions:** [GitHub Discussions](https://github.com/trivajs/triva/discussions)

---

**Thank you for contributing to Triva!** 🎉

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making Triva better for everyone.
