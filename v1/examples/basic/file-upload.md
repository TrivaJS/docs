# File Upload Example

Handle file uploads with Triva and Multer.

## Installation

```bash
npm install @triva/multer
```

## Basic Upload

```javascript
import { build, post, listen } from 'triva';
import multer from '@triva/multer';

await build({ cache: { type: 'memory' } });

// Configure multer
const upload = multer({ dest: './uploads/' });

// Single file upload
post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
});

listen(3000);
```

## Multiple Files

```javascript
// Multiple files from same field
post('/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  res.json({
    message: `${req.files.length} files uploaded`,
    files: req.files.map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      size: f.size
    }))
  });
});

// Multiple fields
post('/upload-profile', 
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  (req, res) => {
    res.json({
      avatar: req.files.avatar?.[0],
      cover: req.files.cover?.[0]
    });
  }
);
```

## With Validation

```javascript
import path from 'path';

const upload = multer({
  dest: './uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

post('/upload-image', upload.single('image'), (req, res) => {
  res.json({ message: 'Image uploaded', file: req.file });
});
```

## Custom Storage

```javascript
import { diskStorage } from '@triva/multer';
import { randomUUID } from 'crypto';

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
```

## With Database

```javascript
import { build, post, get, listen, cache } from 'triva';
import multer from '@triva/multer';

await build({
  cache: {
    type: 'mongodb',
    database: { uri: 'mongodb://localhost:27017' }
  }
});

const upload = multer({ dest: './uploads/' });

// Upload and save metadata
post('/upload', upload.single('file'), async (req, res) => {
  const fileData = {
    id: randomUUID(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: new Date().toISOString()
  };
  
  await cache.set(`file:${fileData.id}`, fileData);
  
  res.json({ file: fileData });
});

// List uploaded files
get('/files', async (req, res) => {
  const keys = await cache.keys('file:*');
  const files = await Promise.all(
    keys.map(key => cache.get(key))
  );
  
  res.json({ files });
});
```

## Testing

```bash
# Upload file
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/image.jpg"

# Upload multiple files
curl -X POST http://localhost:3000/upload-multiple \
  -F "files=@file1.jpg" \
  -F "files=@file2.jpg"
```

## HTML Form

```html
<!DOCTYPE html>
<html>
<body>
  <form action="/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file" required>
    <button type="submit">Upload</button>
  </form>
</body>
</html>
```

---

**[Back to Examples](../README.md)**
