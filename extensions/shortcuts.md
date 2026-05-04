# Shortcuts Extension

## Package

`@trivajs/shortcuts`

## Install

```bash
npm install @trivajs/shortcuts
```

The package installs editor snippets for Triva workflows.

## Example Snippets

- `triva-server`
- `triva-get`
- `triva-post`
- `triva-del`
- `triva-cache-get`
- `triva-cache-set`

## Generated Code Shape

The snippets should produce the current Triva API shape:

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.get('/api', (req, res) => {
  res.json({ ok: true });
});

app.listen(3000);
```
