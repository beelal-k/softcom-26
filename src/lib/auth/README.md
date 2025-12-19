# Authentication API Documentation

This project uses NextAuth.js for authentication with custom registration and login endpoints.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/your-database-name

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
```

Generate a secure secret with:

```bash
openssl rand -base64 32
```

## API Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user with username, email, password, and role.

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

**Fields:**

- `username` (required): Unique username
- `email` (required): Valid email address
- `password` (required): Minimum 6 characters
- `role` (optional): One of `"admin"`, `"user"`, or `"moderator"`. Defaults to `"user"`

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Missing required fields or invalid data
- `409 Conflict`: User with email or username already exists
- `500 Internal Server Error`: Server error

### 2. Login (Sign In)

**Endpoint:** `POST /api/auth/signin`

**Description:** Login with email and password using NextAuth credentials provider.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response:**
Returns a session with JWT token and user information.

**Error Responses:**

- `401 Unauthorized`: Invalid credentials

### 3. Get Session

**Endpoint:** `GET /api/auth/session`

**Description:** Get the current user session.

**Success Response:**

```json
{
  "user": {
    "id": "uuid-here",
    "name": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

### 4. Sign Out

**Endpoint:** `POST /api/auth/signout`

**Description:** Sign out the current user.

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "user"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Get Session

```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## User Roles

The system supports three user roles:

- **admin**: Full system access
- **user**: Standard user access (default)
- **moderator**: Elevated permissions

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT-based session management
- ✅ Email format validation
- ✅ Password strength validation (minimum 6 characters)
- ✅ Duplicate username/email prevention
- ✅ Secure password comparison

## Data Storage

**MongoDB Integration:** ✅ User data is now stored in MongoDB with persistent storage.

- Database connection: `src/lib/db/mongodb.ts`
- User model: `src/lib/auth/user-model.ts`
- User operations: `src/lib/auth/users.ts` (MongoDB-backed)

See `MONGODB_SETUP.md` for detailed MongoDB configuration.

## File Structure

```
src/
├── lib/
│   ├── db/
│   │   └── mongodb.ts         # MongoDB connection
│   └── auth/
│       ├── types.ts           # TypeScript interfaces
│       ├── users.ts           # User storage (MongoDB)
│       ├── user-model.ts      # Mongoose User schema
│       ├── password.ts        # Password hashing utilities
│       ├── auth-options.ts    # NextAuth configuration
│       └── README.md          # This file
└── app/
    └── api/
        └── auth/
            ├── [...nextauth]/
            │   └── route.ts   # NextAuth API handler
            └── register/
                └── route.ts   # Registration endpoint
```

## TypeScript Types

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
}

interface SafeUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
}
```

## Testing

Start the development server:

```bash
pnpm dev
```

Test the registration endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

## Production Considerations

Before deploying to production:

1. ✅ MongoDB database configured
2. ✅ Set a strong `NEXTAUTH_SECRET` environment variable
3. ✅ Use MongoDB Atlas with IP whitelist
4. ✅ Implement rate limiting on authentication endpoints
5. ✅ Add email verification
6. ✅ Implement password reset functionality
7. ✅ Add logging and monitoring
8. ✅ Consider adding 2FA (Two-Factor Authentication)
9. ✅ Implement CSRF protection
10. ✅ Use HTTPS in production
