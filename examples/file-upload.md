# File Upload

Triva does not ship a multipart form-data abstraction. For file uploads, use the native Node stream APIs or plug in a multipart parser that fits your application.

## Minimal Guard

```javascript
app.post('/uploads', async (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({ error: 'Expected multipart form-data' });
  }

  res.status(501).json({
    error: 'Use a multipart parser or stream handler for uploads'
  });
});
```

## Practical Guidance

- validate `content-type`
- stream large uploads instead of buffering them into memory
- store metadata separately from binary data
- sanitize filenames and destination paths
