# res.json()

Send JSON response.

## Signature

```javascript
res.json(data: any): void
```

## Parameters

- `data` (any) - Data to serialize as JSON

## Examples

### Basic Usage

```javascript
get('/api/data', (req, res) => {
  res.json({ 
    success: true,
    data: [1, 2, 3]
  });
});
```

### With Status Code

```javascript
post('/api/users', (req, res) => {
  res.status(201).json({ 
    user: { id: 123, name: 'John' }
  });
});
```

### Array Response

```javascript
get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});
```

## Notes

- Automatically sets Content-Type: application/json
- Serializes data with JSON.stringify()
- Ends response automatically
- Chainable with status()

## See Also

- [res.send()](send.md) - Send text
- [res.status()](status.md) - Set status code
