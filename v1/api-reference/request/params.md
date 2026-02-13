# req.params

Route parameters extracted from URL path.

## Type

`object`

## Description

Object containing route parameters defined with `:paramName` in route paths.

## Examples

### Single Parameter

```javascript
get('/users/:id', (req, res) => {
  console.log(req.params.id);
  // URL: /users/123 → '123'
  
  res.json({ userId: req.params.id });
});
```

### Multiple Parameters

```javascript
get('/posts/:postId/comments/:commentId', (req, res) => {
  console.log(req.params);
  // URL: /posts/5/comments/10
  // { postId: '5', commentId: '10' }
  
  res.json({
    postId: req.params.postId,
    commentId: req.params.commentId
  });
});
```

### With Validation

```javascript
get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ 
      error: 'Invalid ID' 
    });
  }
  
  res.json({ userId: id });
});
```

### Destructuring

```javascript
get('/api/:version/users/:userId', (req, res) => {
  const { version, userId } = req.params;
  
  res.json({ version, userId });
});
```

## Notes

- Always strings (convert to numbers as needed)
- Only contains parameters defined in route path
- Empty object if no parameters in route
- Parameters are URL-decoded automatically

## See Also

- [req.query](query.md) - Query string parameters
- [Routing Guide](../../guides/routing.md)
