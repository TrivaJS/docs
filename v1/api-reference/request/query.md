# req.query

Query string parameters from URL.

## Type

`object`

## Description

Object containing parsed query string parameters from the URL.

## Examples

### Single Parameter

```javascript
get('/search', (req, res) => {
  console.log(req.query.q);
  // URL: /search?q=triva → 'triva'
  
  res.json({ query: req.query.q });
});
```

### Multiple Parameters

```javascript
get('/products', (req, res) => {
  console.log(req.query);
  // URL: /products?category=electronics&sort=price
  // { category: 'electronics', sort: 'price' }
  
  res.json({
    category: req.query.category,
    sort: req.query.sort
  });
});
```

### With Defaults

```javascript
get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  res.json({ page, limit });
});
```

### Array Parameters

```javascript
get('/filter', (req, res) => {
  // URL: /filter?tags=js&tags=node
  const tags = Array.isArray(req.query.tags)
    ? req.query.tags
    : [req.query.tags];
  
  res.json({ tags });
});
```

## Notes

- All values are strings
- Convert to numbers/booleans as needed
- Empty object if no query string
- Duplicate keys create arrays
- Query values are URL-decoded

## See Also

- [req.params](params.md) - Route parameters
- [Routing Guide](../../guides/routing.md)
