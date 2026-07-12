# Customer Query Management System — Backend

Production-ready REST API built with Node.js, Express.js, MongoDB, and Mongoose. Implements clean layered architecture (Controllers → Services → Repositories → Database) with JWT authentication, full CRUD, soft delete, pagination, search, and filtering.

---

## Quick Start

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev
```

Server starts at `http://localhost:5000`

---

## Environment Variables

| Variable              | Description                         | Example                        |
|-----------------------|-------------------------------------|--------------------------------|
| `PORT`                | Server port                         | `5000`                         |
| `MONGO_URI`           | MongoDB connection string           | `mongodb://localhost:27017/cq` |
| `JWT_SECRET`          | JWT signing secret (min 32 chars)   | `supersecretkey...`            |
| `JWT_EXPIRES_IN`      | JWT expiry duration                 | `7d`                           |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiry in days             | `7`                            |
| `NODE_ENV`            | Environment                         | `development` / `production`   |
| `CLIENT_URL`          | Frontend URL for CORS               | `http://localhost:5173`        |
| `BCRYPT_SALT_ROUNDS`  | Password hashing rounds             | `12`                           |

---

## Scripts

| Command          | Description                     |
|------------------|---------------------------------|
| `npm run dev`    | Start dev server with nodemon   |
| `npm start`      | Start production server         |
| `npm run lint`   | Run ESLint                      |
| `npm run lint:fix` | Auto-fix lint errors          |
| `npm run format` | Format with Prettier            |
| `npm test`       | Run Jest tests                  |

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # DB, env, logger setup
│   ├── constants/        # Enums, shared constants
│   ├── controllers/      # Request/response handlers only
│   ├── docs/             # Swagger spec
│   ├── errors/           # Custom error classes
│   ├── logs/             # Morgan log output
│   ├── middlewares/      # Auth, validation, rate limiter, error handler
│   ├── models/           # Mongoose schemas
│   ├── repositories/     # All DB queries
│   ├── responses/        # Response formatters
│   ├── routes/           # Express routers
│   ├── services/         # Business logic
│   ├── utils/            # JWT, pagination, query builder
│   ├── validators/       # express-validator rules
│   ├── app.js            # Express app setup
│   └── server.js         # Entry point
├── tests/
├── .env.example
├── package.json
└── README.md
```

---

## API Documentation

Swagger UI available at: `http://localhost:5000/api-docs`

### Base URL
```
/api/v1
```

### Auth Routes

| Method | Endpoint             | Description           | Auth Required |
|--------|----------------------|-----------------------|---------------|
| POST   | `/auth/register`     | Register user         | No            |
| POST   | `/auth/login`        | Login                 | No            |
| POST   | `/auth/logout`       | Logout                | Yes           |
| GET    | `/auth/me`           | Get current user      | Yes           |

### Query Routes

| Method | Endpoint                     | Description                  | Roles              |
|--------|------------------------------|------------------------------|--------------------|
| GET    | `/queries`                   | List queries (search/filter) | All                |
| POST   | `/queries`                   | Create query                 | All                |
| GET    | `/queries/stats`             | Get statistics               | All                |
| GET    | `/queries/:id`               | Get single query             | All                |
| PATCH  | `/queries/:id`               | Update query                 | All                |
| DELETE | `/queries/:id`               | Soft delete                  | Admin, Support     |
| PATCH  | `/queries/:id/restore`       | Restore deleted              | Admin              |
| PATCH  | `/queries/:id/status`        | Update status                | Admin, Support     |
| PATCH  | `/queries/:id/priority`      | Update priority              | Admin, Support     |
| PATCH  | `/queries/:id/assign`        | Assign support agent         | Admin, Support     |
| POST   | `/queries/bulk-delete`       | Bulk soft delete             | Admin, Support     |
| POST   | `/queries/bulk-restore`      | Bulk restore                 | Admin              |

### User Routes

| Method | Endpoint                | Description         | Roles   |
|--------|-------------------------|---------------------|---------|
| GET    | `/users`                | List all users      | Admin   |
| GET    | `/users/agents`         | List support agents | All     |
| GET    | `/users/:id`            | Get user by ID      | Admin   |
| PATCH  | `/users/:id`            | Update user         | All     |
| PATCH  | `/users/:id/deactivate` | Deactivate user     | Admin   |

### Query Parameters (GET /queries)

| Param       | Type    | Description                                         |
|-------------|---------|-----------------------------------------------------|
| `search`    | string  | Search across name, email, phone, subject, desc     |
| `status`    | string  | Filter by status enum                               |
| `priority`  | string  | Filter by priority enum                             |
| `category`  | string  | Filter by category enum                             |
| `assignedTo`| ObjectId| Filter by assigned user                             |
| `startDate` | ISO8601 | Filter by creation date range start                 |
| `endDate`   | ISO8601 | Filter by creation date range end                   |
| `sort`      | string  | newest, oldest, priority, status, alphabetical      |
| `page`      | integer | Page number (default: 1)                            |
| `limit`     | integer | Items per page (default: 10, max: 100)              |
| `deleted`   | boolean | Include soft-deleted (Admin only)                   |

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "totalDocuments": 50,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

---

## Security Features

- **Helmet** — HTTP security headers
- **CORS** — Restricted to `CLIENT_URL`
- **Rate Limiting** — 200 req/15min global, 20 req/15min on auth routes
- **HPP** — HTTP Parameter Pollution prevention
- **XSS Clean** — Input sanitization
- **JWT** — Stateless authentication via Bearer token + HttpOnly cookie
- **bcryptjs** — Password hashing (configurable salt rounds)
- **Input Validation** — express-validator on every route

---

## Deployment

### Render / Railway
Set environment variables in the dashboard. Use `npm start` as the start command.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```

---

## Future Improvements

- Refresh token rotation
- Email notifications on query assignment
- File attachment support with S3
- WebSocket for real-time query updates
- Redis caching for frequently accessed queries
- Two-factor authentication
- Audit log trail for query status changes
- Export queries to CSV/PDF
