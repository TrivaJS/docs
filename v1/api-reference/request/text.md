# req.text()

Get request body as text.

## Signature

```javascript
async req.text(): Promise<string>
```

## Returns

`Promise<string>` - Request body as string

## Examples

### Basic Usage

```javascript
post('/api/text', async (req, res) => {
  const text = await req.text();
  
  console.log(text);
  // "Plain text content"
  
  res.json({ 
    length: text.length,
    preview: text.substring(0, 100)
  });
});
```

### Processing Text

```javascript
post('/api/markdown', async (req, res) => {
  const markdown = await req.text();
  const html = convertMarkdownToHTML(markdown);
  
  res.send(html);
});
```

## Notes

- Returns entire body as string
- For JSON use req.json() instead
- Returns promise - must await

## See Also

- [req.json()](json.md) - Parse as JSON
