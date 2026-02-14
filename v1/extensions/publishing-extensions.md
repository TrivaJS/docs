# Publishing Extensions

Guide to publishing your Triva extension to npm and the extension directory.

## Table of Contents

- [Before Publishing](#before-publishing)
- [npm Publishing](#npm-publishing)
- [Extension Directory](#extension-directory)
- [Marketing](#marketing)
- [Maintenance](#maintenance)

---

## Before Publishing

### Checklist

Before publishing, ensure you have:

- ✅ **Complete README** - Installation, usage, API docs
- ✅ **Tests** - Passing unit and integration tests
- ✅ **Examples** - Working example code
- ✅ **License** - MIT recommended
- ✅ **Changelog** - Document changes
- ✅ **Version** - Follow semantic versioning
- ✅ **Keywords** - Include 'triva', 'triva-extension'
- ✅ **Repository** - GitHub/GitLab URL

### Code Quality

```bash
# Run tests
npm test

# Check for issues
npm run lint

# Build if needed
npm run build
```

---

## npm Publishing

### 1. Create npm Account

```bash
npm login
```

### 2. Prepare package.json

```json
{
  "name": "@username/triva-extension-name",
  "version": "1.0.0",
  "description": "Brief description",
  "main": "src/index.js",
  "type": "module",
  "keywords": [
    "triva",
    "triva-extension",
    "middleware",
    "your-keywords"
  ],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/triva-extension-name"
  },
  "bugs": {
    "url": "https://github.com/username/triva-extension-name/issues"
  },
  "homepage": "https://github.com/username/triva-extension-name#readme",
  "peerDependencies": {
    "triva": "^1.0.0"
  },
  "files": [
    "src",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

### 3. Create .npmignore

```
# .npmignore
test/
examples/
docs/
.github/
.vscode/
*.test.js
.env
.DS_Store
```

### 4. Publish

```bash
# Dry run first
npm publish --dry-run

# Publish (public)
npm publish --access public

# Or scoped package
npm publish
```

### 5. Verify

```bash
# Install your package
npm install @username/triva-extension-name

# Test it works
```

---

## Extension Directory

### Submit to Official Directory

1. **Fork the Triva website repo**
   ```bash
   git clone https://github.com/trivajs/website
   ```

2. **Add your extension**
   
   Create `website/extensions/your-extension.md`:
   
   ```yaml
   ---
   name: Extension Name
   package: @username/triva-extension-name
   version: 1.0.0
   author: Your Name
   description: Brief description
   category: middleware
   tags: [cors, security, auth]
   npm: https://npmjs.com/package/@username/triva-extension-name
   github: https://github.com/username/triva-extension-name
   ---
   
   # Extension Name
   
   Detailed description here.
   
   ## Installation
   
   \`\`\`bash
   npm install @username/triva-extension-name
   \`\`\`
   
   ## Usage
   
   \`\`\`javascript
   import { use } from 'triva';
   import extension from '@username/triva-extension-name';
   
   use(extension());
   \`\`\`
   ```

3. **Submit Pull Request**
   ```bash
   git checkout -b add-my-extension
   git add .
   git commit -m "Add my-extension to directory"
   git push origin add-my-extension
   ```

4. **Wait for Review**
   - Maintainers review within 1 week
   - Address feedback if needed
   - Merge and publish!

---

## Versioning

### Semantic Versioning

Follow [semver](https://semver.org):

**MAJOR.MINOR.PATCH**

```bash
# Breaking changes
npm version major  # 1.0.0 → 2.0.0

# New features
npm version minor  # 1.0.0 → 1.1.0

# Bug fixes
npm version patch  # 1.0.0 → 1.0.1
```

### Changelog

Keep CHANGELOG.md updated:

```markdown
# Changelog

## [1.1.0] - 2026-02-13

### Added
- New `timeout` option
- Support for custom error handlers

### Changed
- Improved error messages

### Fixed
- Memory leak in connection pool

## [1.0.0] - 2026-01-15

### Added
- Initial release
```

---

## Marketing

### 1. GitHub README

Make it compelling:

```markdown
# 🚀 Triva Extension Name

[![npm version](https://img.shields.io/npm/v/@username/triva-extension-name.svg)](https://npmjs.com/package/@username/triva-extension-name)
[![Downloads](https://img.shields.io/npm/dm/@username/triva-extension-name.svg)](https://npmjs.com/package/@username/triva-extension-name)
[![License](https://img.shields.io/npm/l/@username/triva-extension-name.svg)](LICENSE)

Brief, compelling description.

## ✨ Features

- Feature 1
- Feature 2
- Feature 3

## 📦 Installation

\`\`\`bash
npm install @username/triva-extension-name
\`\`\`

## 🚀 Quick Start

\`\`\`javascript
// Simple example
\`\`\`

## 📖 Documentation

[Full documentation](https://link-to-docs)

## 🤝 Contributing

Contributions welcome!

## 📄 License

MIT © Your Name
```

### 2. Social Media

Share on:
- Twitter/X with #trivajs
- Reddit r/node
- Dev.to with triva tag
- Hacker News (if significant)

### 3. Blog Post

Write a launch post:
- Problem it solves
- How it works
- Usage examples
- Future plans

### 4. Demo

Create:
- Live demo site
- Video tutorial
- GIF/screenshots

---

## Maintenance

### Issue Management

**Respond to issues:**
- Within 48 hours
- Label appropriately
- Ask for reproduction
- Fix bugs promptly

**Templates:**

`.github/ISSUE_TEMPLATE/bug_report.md`:
```markdown
**Describe the bug**
A clear description.

**To Reproduce**
Steps to reproduce.

**Expected behavior**
What you expected.

**Environment:**
- Triva version:
- Extension version:
- Node version:
```

### Pull Requests

**Review checklist:**
- ✅ Tests pass
- ✅ Code style consistent
- ✅ Documentation updated
- ✅ No breaking changes (or documented)

### Regular Updates

**Monthly:**
- Check dependencies for updates
- Review open issues
- Respond to questions

**Quarterly:**
- Update to latest Triva version
- Add new features
- Improve documentation

### Deprecation

If deprecating:

1. **Add deprecation notice**
   ```javascript
   export default function myExtension(options) {
     console.warn('DEPRECATED: This extension is no longer maintained. Use @new/package instead.');
     // ...
   }
   ```

2. **Update README**
   ```markdown
   # ⚠️ DEPRECATED
   
   This package is deprecated. Please use [@new/package](link) instead.
   ```

3. **Publish deprecation**
   ```bash
   npm deprecate @username/package "Use @new/package instead"
   ```

---

## Promotion Checklist

After publishing:

- [ ] Add to npm
- [ ] Submit to extension directory
- [ ] Create GitHub release
- [ ] Write announcement blog post
- [ ] Share on Twitter/X
- [ ] Post on Reddit r/node
- [ ] Share on Dev.to
- [ ] Update personal website/portfolio
- [ ] Email Triva team (extensions@trivajs.com)
- [ ] Add to GitHub topics (triva-extension)

---

## Example: Publishing Checklist

```bash
# 1. Prepare
npm test                    # Tests pass
npm run lint               # Code clean
git status                 # No uncommitted changes

# 2. Update version
npm version patch          # or minor, or major
git push && git push --tags

# 3. Publish
npm publish --access public

# 4. Verify
npm install -g @username/triva-extension-name
# Test it works

# 5. Announce
# - GitHub release
# - Social media
# - Extension directory PR
```

---

## Support

### Providing Support

**Where to help users:**
- GitHub Issues (primary)
- Discord #extensions channel
- Stack Overflow (triva tag)

**Response times:**
- Critical bugs: 24 hours
- Regular issues: 48 hours
- Feature requests: 1 week
- Questions: 48 hours

### Getting Help

**Extension development help:**
- Discord #extension-dev
- GitHub Discussions
- Email: extensions@trivajs.com

---

## Analytics

Track your extension's success:

### npm Stats

```bash
# Downloads
npm info @username/package

# View on npm website
https://npmjs.com/package/@username/package
```

### GitHub Insights

Monitor:
- Stars
- Forks
- Issues
- Pull requests
- Traffic

### User Feedback

Collect via:
- GitHub issues
- npm reviews
- Twitter mentions
- Blog comments

---

## Official Extension Status

To become an **official extension** (@triva/name):

### Requirements

1. **Quality** - Well-tested, documented, maintained
2. **Adoption** - 1000+ downloads/month
3. **Stability** - 6+ months of active maintenance
4. **Community** - Positive user feedback

### Application

Email extensions@trivajs.com with:
- Package name
- npm stats
- Use cases
- Maintenance commitment

### Benefits

- **@triva namespace** - Official package name
- **Featured** - Listed prominently
- **Support** - Priority support
- **Collaboration** - Work with core team

---

## Next Steps

- **[Creating Extensions](creating-extensions.md)** - Build guide
- **[Official Extensions](official/)** - Study examples
- **[Extension Directory](community/directory.md)** - Browse extensions

---

**Questions?** [GitHub Discussions](https://github.com/trivajs/triva/discussions)
