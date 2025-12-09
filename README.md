# Skitt Backend - Feature Flags & Experiment Platform

A robust Node.js/TypeScript backend API for managing feature flags, user targeting, and A/B experiments with comprehensive metrics and analytics.

## 🚀 Features

- **Feature Flag Management**: Create, update, and manage feature flags
- **User Targeting**: Enable/disable features for specific users
- **Experiment Management**: Create and manage A/B tests with variant distribution
- **Metrics & Analytics**: Track flag usage, events, and dashboard metrics
- **RESTful API**: Clean, well-documented REST endpoints
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript support with Zod validation
- **PostgreSQL**: Robust relational database with proper schema design

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI (swagger-jsdoc, swagger-ui-express)
- **Architecture**: Service-oriented with separation of concerns

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   
   # PostgreSQL Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=skitt
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

4. **Create PostgreSQL database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE skitt;
   
   # Exit psql
   \q
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

   The server will automatically:
   - Initialize the database schema
   - Start on the configured port (default: 3001)
   - Set up Swagger documentation at `http://localhost:3001/api-docs`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (Swagger, etc.)
│   ├── database/        # Database connection and initialization
│   ├── middleware/       # Express middleware (error handling, async)
│   ├── models/          # Database models/data access layer
│   ├── routes/          # API route definitions (endpoints only)
│   ├── schemas/         # Zod validation schemas
│   ├── services/        # Business logic layer
│   └── index.ts        # Application entry point
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## 🏗 Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

- **Routes**: Handle HTTP requests/responses only, delegate to services
- **Services**: Contain all business logic and validation
- **Models**: Data access layer (database queries)
- **Schemas**: Input validation using Zod
- **Middleware**: Error handling and async wrapper

### Request Flow

```
Request → Route → Service → Model → Database
                ↓
         Validation (Zod)
                ↓
         Error Handling
```

## 📡 API Endpoints

### Feature Flags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flags` | Get all feature flags |
| GET | `/api/flags/:id` | Get feature flag by ID |
| POST | `/api/flags` | Create a new feature flag |
| PUT | `/api/flags/:id` | Update a feature flag |
| DELETE | `/api/flags/:id` | Delete a feature flag |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |
| GET | `/api/users/:userId/flags` | Get flags assigned to a user |
| POST | `/api/users/:userId/flags/:flagId` | Assign flag to user |
| DELETE | `/api/users/:userId/flags/:flagId` | Remove flag from user |

### Experiments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experiments` | Get all experiments |
| GET | `/api/experiments/:id` | Get experiment by ID |
| GET | `/api/experiments/flag/:flagId` | Get experiments by flag ID |
| POST | `/api/experiments` | Create a new experiment |
| PUT | `/api/experiments/:id` | Update an experiment |
| DELETE | `/api/experiments/:id` | Delete an experiment |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/metrics/events` | Track a flag event |
| GET | `/api/metrics` | Get metrics for all flags |
| GET | `/api/metrics/flags/:flagId` | Get metrics for a specific flag |
| GET | `/api/metrics/dashboard` | Get dashboard summary |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:

**URL**: `http://localhost:3001/api-docs`

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Example requests and responses

## 💻 Development

### Available Scripts

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Type checking without building
npm run type-check
```

### Code Style

- Use TypeScript for all code
- Follow the existing architecture pattern
- Keep routes thin (endpoints only)
- Put all logic in services
- Use Zod schemas for validation
- Handle errors using AppError class

### Adding New Endpoints

1. **Create/Update Schema** in `src/schemas/`
2. **Add Service Method** in `src/services/`
3. **Add Route** in `src/routes/`
4. **Add Swagger Documentation** in route file
5. **Update Swagger Config** if needed in `src/config/swagger.ts`

## 🗄 Database Schema

### Tables

- **feature_flags**: Core feature flag definitions
- **users**: User information and attributes
- **user_flag_assignments**: User-specific flag overrides
- **experiments**: A/B test configurations
- **experiment_assignments**: User experiment assignments
- **flag_events**: Event tracking for analytics

The database schema is automatically initialized on server start.

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `db_name` |
| `DB_USER` | Database user | `user` |
| `DB_PASSWORD` | Database password | `password` |

## 🧪 Example Requests

### Create a Feature Flag

```bash
curl -X POST http://localhost:3001/api/flags \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new-checkout-flow",
    "name": "New Checkout Flow",
    "description": "Enable the new checkout experience",
    "enabled": false
  }'
```

### Assign Flag to User

```bash
curl -X POST http://localhost:3001/api/users/user123/flags/1 \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true
  }'
```

### Track Event

```bash
curl -X POST http://localhost:3001/api/metrics/events \
  -H "Content-Type: application/json" \
  -d '{
    "flag_id": 1,
    "user_id": "user123",
    "event_type": "viewed",
    "metadata": {"page": "checkout"}
  }'
```

## 🐛 Error Handling

The API uses consistent error responses:

```json
{
  "error": "Error message"
}
```

Error status codes:
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `409`: Conflict (duplicate resources)
- `500`: Internal Server Error

## 📝 License

ISC

## 🤝 Contributing

1. Follow the existing code structure
2. Keep routes thin - all logic in services
3. Add Zod schemas for validation
4. Update Swagger documentation
5. Test your changes
6. Push your codes

## 📞 Support

For issues and questions, please refer to the main project documentation.

