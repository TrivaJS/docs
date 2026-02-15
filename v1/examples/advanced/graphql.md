# GraphQL Example

Build a GraphQL server with Triva.

## Installation

```bash
npm install graphql
```

## Basic GraphQL Server

```javascript
import { build, post, get, listen } from 'triva';
import { buildSchema, graphql } from 'graphql';

await build({ cache: { type: 'memory' } });

// Define schema
const schema = buildSchema(`
  type Query {
    hello: String
    user(id: ID!): User
    users: [User]
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): Boolean
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String
  }
`);

// In-memory storage
const users = new Map();
let nextId = 1;

// Root resolvers
const root = {
  hello: () => 'Hello, GraphQL with Triva!',
  
  user: ({ id }) => users.get(id),
  
  users: () => Array.from(users.values()),
  
  createUser: ({ name, email }) => {
    const user = {
      id: String(nextId++),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    users.set(user.id, user);
    return user;
  },
  
  updateUser: ({ id, name, email }) => {
    const user = users.get(id);
    if (!user) return null;
    
    const updated = {
      ...user,
      ...(name && { name }),
      ...(email && { email })
    };
    
    users.set(id, updated);
    return updated;
  },
  
  deleteUser: ({ id }) => {
    return users.delete(id);
  }
};

// GraphQL endpoint
post('/graphql', async (req, res) => {
  const { query, variables } = await req.json();
  
  const result = await graphql({
    schema,
    source: query,
    rootValue: root,
    variableValues: variables
  });
  
  res.json(result);
});

// GraphiQL interface
get('/graphql', (req, res) => {
  res.header('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>GraphQL Playground</title>
        <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
      </head>
      <body style="margin: 0;">
        <div id="graphiql" style="height: 100vh;"></div>
        <script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/graphiql/graphiql.min.js"></script>
        <script>
          const fetcher = GraphiQL.createFetcher({
            url: '/graphql',
          });
          
          ReactDOM.render(
            React.createElement(GraphiQL, { fetcher }),
            document.getElementById('graphiql')
          );
        </script>
      </body>
    </html>
  `);
});

listen(3000);
console.log('🚀 GraphQL server running at http://localhost:3000/graphql');
```

## Example Queries

### Query Users

```graphql
query {
  users {
    id
    name
    email
    createdAt
  }
}
```

### Query Single User

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}

# Variables
{
  "id": "1"
}
```

### Create User

```graphql
mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
    createdAt
  }
}

# Variables
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Update User

```graphql
mutation {
  updateUser(id: "1", name: "Jane Doe") {
    id
    name
    email
  }
}
```

### Delete User

```graphql
mutation {
  deleteUser(id: "1")
}
```

## With Database

```javascript
import { build, post, listen, cache } from 'triva';
import { buildSchema, graphql } from 'graphql';

await build({
  cache: {
    type: 'mongodb',
    database: { uri: 'mongodb://localhost:27017/graphql' }
  }
});

const schema = buildSchema(`
  type Query {
    users: [User]
    user(id: ID!): User
  }
  
  type Mutation {
    createUser(name: String!, email: String!): User
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
  }
`);

const root = {
  users: async () => {
    const keys = await cache.keys('user:*');
    return Promise.all(keys.map(k => cache.get(k)));
  },
  
  user: async ({ id }) => {
    return cache.get(`user:${id}`);
  },
  
  createUser: async ({ name, email }) => {
    const id = Date.now().toString();
    const user = { id, name, email };
    await cache.set(`user:${id}`, user);
    return user;
  }
};

post('/graphql', async (req, res) => {
  const { query, variables } = await req.json();
  const result = await graphql({ schema, source: query, rootValue: root, variableValues: variables });
  res.json(result);
});

listen(3000);
```

## With Authentication

```javascript
import { sign, verify } from '@triva/jwt';

const schema = buildSchema(`
  type Query {
    me: User
    users: [User]
  }
  
  type Mutation {
    login(email: String!, password: String!): AuthPayload
    createUser(name: String!, email: String!, password: String!): AuthPayload
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
  }
  
  type AuthPayload {
    token: String!
    user: User!
  }
`);

const root = {
  me: (args, context) => {
    if (!context.user) throw new Error('Not authenticated');
    return context.user;
  },
  
  login: async ({ email, password }) => {
    // Validate credentials...
    const user = users.get(email);
    if (!user) throw new Error('Invalid credentials');
    
    const token = sign({ userId: user.id }, process.env.JWT_SECRET);
    return { token, user };
  }
};

post('/graphql', async (req, res) => {
  const { query, variables } = await req.json();
  
  // Extract user from token
  const token = req.headers.authorization?.replace('Bearer ', '');
  let user = null;
  
  if (token) {
    try {
      const payload = verify(token, process.env.JWT_SECRET);
      user = users.get(payload.userId);
    } catch (error) {
      // Invalid token
    }
  }
  
  const result = await graphql({
    schema,
    source: query,
    rootValue: root,
    contextValue: { user },
    variableValues: variables
  });
  
  res.json(result);
});
```

## Nested Resolvers

```javascript
const schema = buildSchema(`
  type Query {
    user(id: ID!): User
  }
  
  type User {
    id: ID!
    name: String!
    posts: [Post]
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User
  }
`);

const root = {
  user: ({ id }) => ({
    id,
    name: users.get(id)?.name,
    posts: () => posts.filter(p => p.authorId === id)
  })
};
```

## Error Handling

```javascript
post('/graphql', async (req, res) => {
  try {
    const { query, variables } = await req.json();
    
    const result = await graphql({
      schema,
      source: query,
      rootValue: root,
      variableValues: variables
    });
    
    // GraphQL errors
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      errors: [{
        message: 'Internal server error'
      }]
    });
  }
});
```

## Testing

```bash
# Using curl
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id name email } }"}'

# Create user
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation($name: String!, $email: String!) { createUser(name: $name, email: $email) { id name email } }",
    "variables": {"name": "John", "email": "john@example.com"}
  }'
```

---

**[Back to Examples](../README.md)**
