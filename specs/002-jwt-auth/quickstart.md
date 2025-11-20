# Quickstart Guide: JWT Authentication System

**Feature**: JWT Authentication System  
**Branch**: `002-jwt-auth`  
**Last Updated**: 2025-11-19

## Overview

This guide helps developers quickly understand and use the JWT authentication feature. Three new MCP tools enable user registration, login, and token retrieval for accessing protected endpoints.

---

## Prerequisites

- MCP server running (see main README.md)
- External auth API endpoints available (or using mock mode)
- MCP inspector or client for testing tools

---

## Quick Start (5 minutes)

### 1. Start the MCP Server

```bash
# Build the project
pnpm build

# Start in HTTP mode for testing
pnpm start:http
```

Server starts on `http://localhost:3000/mcp`

### 2. Test with MCP Inspector

```bash
# Open inspector
pnpm inspect
```

### 3. Create Account (Signup)

```json
Tool: signup
Input: {
  "email": "test@example.com",
  "password": "MySecurePassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Output**:

```json
{
  "success": true,
  "message": "Signup successful",
  "userId": "usr_xxx"
}
```

### 4. Login (Existing User)

```json
Tool: login
Input: {
  "email": "test@example.com",
  "password": "MySecurePassword123!"
}
```

**Expected Output**:

```json
{
  "success": true,
  "message": "Login successful",
  "userId": "usr_xxx"
}
```

### 5. Get Authentication Token

```json
Tool: get-token
Input: {}
```

**Expected Output**:

```json
{
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "usr_xxx"
}
```

---

## Tool Reference

### Tool: `signup`

**Purpose**: Register new user account

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | User password |
| firstName | string | No | First name |
| lastName | string | No | Last name |

**Success Response**:

```json
{
  "success": true,
  "message": "Signup successful",
  "userId": "usr_1234567890"
}
```

**Error Response**:

```json
{
  "error": "user_exists",
  "details": "An account with this email already exists"
}
```

**Common Errors**:

- `user_exists`: Email already registered
- `validation_error`: Invalid email format or missing required fields
- `network_error`: Cannot reach auth API
- `server_error`: Auth API internal error

---

### Tool: `login`

**Purpose**: Authenticate existing user

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| email | string | Yes | User email |
| password | string | Yes | User password |

**Success Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "userId": "usr_1234567890"
}
```

**Error Response**:

```json
{
  "error": "invalid_credentials",
  "details": "Email or password is incorrect"
}
```

**Common Errors**:

- `invalid_credentials`: Wrong email or password
- `validation_error`: Invalid email format
- `network_error`: Cannot reach auth API
- `server_error`: Auth API internal error

---

### Tool: `get-token`

**Purpose**: Retrieve stored authentication token

**Parameters**: None

**Success Response (Authenticated)**:

```json
{
  "authenticated": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "usr_1234567890"
}
```

**Response (Not Authenticated)**:

```json
{
  "authenticated": false,
  "token": null,
  "userId": null,
  "message": "No active session. Please login or signup first."
}
```

---

## Common Workflows

### Workflow 1: New User Registration → Protected API Call

```bash
# Step 1: Create account
signup({ email, password, firstName, lastName })
→ Returns: { success: true, userId }

# Step 2: Get token (automatically stored after signup)
get-token()
→ Returns: { authenticated: true, token: "..." }

# Step 3: Use token in protected endpoint
# (Future feature - token will be included in Authorization header)
```

### Workflow 2: Returning User Login → Protected API Call

```bash
# Step 1: Login
login({ email, password })
→ Returns: { success: true, userId }

# Step 2: Get token (automatically stored after login)
get-token()
→ Returns: { authenticated: true, token: "..." }

# Step 3: Use token in protected endpoint
# (Future feature)
```

### Workflow 3: Check Authentication Status

```bash
# No parameters needed
get-token()

# If authenticated:
→ Returns: { authenticated: true, token: "...", userId: "..." }

# If not authenticated:
→ Returns: { authenticated: false, token: null, message: "..." }
```

---

## Configuration

### Auth API Endpoints

Edit `src/features/jwt-auth/constants.ts`:

```typescript
export const AUTH_API_CONFIG = {
  BASE_URL: "https://your-auth-api.com",
  LOGIN_ENDPOINT: "/api/auth/login",
  SIGNUP_ENDPOINT: "/api/auth/signup",
  TIMEOUT_MS: 5000,
};
```

### Mock Mode (Development)

For testing without real API, the initial implementation uses mock responses:

```typescript
// Mock response returned for any login/signup
{
  token: "mock-jwt-token-" + Date.now(),
  userId: "mock-user-" + randomId(),
  expiresAt: oneHourFromNow()
}
```

To enable real API, update endpoint URLs in constants.

---

## Token Storage

### How It Works

- **Storage Type**: In-memory Map
- **Lifecycle**: Lost on server restart
- **Capacity**: Single user session
- **Key**: userId
- **Value**: { token, userId, storedAt, email }

### When Token is Stored

Automatically stored after:

- Successful `signup`
- Successful `login`

### When Token is Cleared

- Server restart
- New login (overwrites previous token)

### Token Expiration

- Token itself contains expiration (set by auth API)
- System doesn't track expiration
- Expired tokens will be rejected by protected endpoints
- User must login again when token expires

---

## Troubleshooting

### Issue: "No active session" when calling get-token

**Cause**: User hasn't logged in or server restarted

**Solution**: Call `login` or `signup` first

### Issue: Login fails with "invalid_credentials"

**Causes**:

- Wrong email or password
- Account doesn't exist (use `signup` first)
- Typo in email

**Solution**:

- Verify credentials
- Try signup if account doesn't exist
- Check email format

### Issue: Signup fails with "user_exists"

**Cause**: Email already registered

**Solution**: Use `login` instead or use different email

### Issue: Network error

**Causes**:

- Auth API is down
- Wrong API URL in constants
- Network connectivity issues

**Solution**:

- Check auth API status
- Verify endpoint URLs in `constants.ts`
- Check network connection

### Issue: Token not being included in protected endpoint calls

**Cause**: Protected endpoint integration not implemented yet

**Solution**:

- This is a future feature
- For now, manually copy token from `get-token` response
- Or wait for protected endpoint tools to be implemented

---

## Architecture Overview

```
┌─────────────┐
│ MCP Client  │
│  (User)     │
└──────┬──────┘
       │
       │ calls tool
       ▼
┌─────────────────────┐
│  MCP Tools          │
│  - login            │
│  - signup           │
│  - get-token        │
└──────┬──────────────┘
       │
       ├───────────┬──────────────┐
       │           │              │
       ▼           ▼              ▼
┌───────────┐ ┌──────────┐ ┌─────────────┐
│ Auth API  │ │  Token   │ │   Logger    │
│  Service  │ │ Storage  │ │   Utility   │
└───────────┘ └──────────┘ └─────────────┘
       │
       ▼
┌───────────────┐
│ External Auth │
│     API       │
└───────────────┘
```

---

## Next Steps

### For Developers

1. **Review implementation files**:

   - `src/features/jwt-auth/tools/*.ts` - Tool implementations
   - `src/features/jwt-auth/services/*.ts` - Auth API and storage
   - `src/features/jwt-auth/constants.ts` - Configuration

2. **Extend for protected endpoints**:

   - Create new MCP tools for protected resources
   - Import token storage service
   - Include token in Authorization header

3. **Add real auth API**:
   - Update endpoint URLs in constants
   - Remove mock response logic
   - Test with real credentials

### For Users

1. **Create your account**: Use `signup` tool
2. **Login when returning**: Use `login` tool
3. **Access protected resources**: Get token with `get-token`, then use in future protected endpoint tools

---

## Testing Examples

### Test Script (Manual)

```bash
# 1. Start server
pnpm start:http

# 2. Open inspector in browser
pnpm inspect

# 3. Test signup
Tool: signup
{"email":"test1@example.com","password":"Pass123!","firstName":"Test"}

# 4. Test get-token (should be authenticated)
Tool: get-token
{}

# 5. Restart server (simulates token loss)

# 6. Test get-token (should be not authenticated)
Tool: get-token
{}

# 7. Test login
Tool: login
{"email":"test1@example.com","password":"Pass123!"}

# 8. Test get-token (should be authenticated again)
Tool: get-token
{}
```

### Edge Cases to Test

1. **Invalid email format**: `{"email":"notanemail","password":"test"}`
2. **Missing password**: `{"email":"test@example.com"}`
3. **Duplicate signup**: Call signup twice with same email
4. **Get token before login**: Call get-token without logging in
5. **Server restart**: Restart server and verify token is cleared

---

## FAQ

**Q: How long does the token last?**  
A: Token expiration is set by the external auth API (typically 1 hour). The token itself contains the expiration time.

**Q: Can I have multiple users logged in?**  
A: Currently no - only single user session supported. New login overwrites previous token.

**Q: What happens if the server restarts?**  
A: Token storage is in-memory, so all tokens are lost. Users must login again.

**Q: How do I use the token in my API calls?**  
A: Call `get-token` to retrieve the token, then include it in the Authorization header as `Bearer {token}`. Future protected endpoint tools will do this automatically.

**Q: Can I logout?**  
A: Not currently implemented. Token becomes invalid when it expires or server restarts.

**Q: Is the password secure?**  
A: Yes - passwords are never stored. They're sent to external auth API which handles hashing and validation.

---

## Resources

- **Feature Spec**: `specs/002-jwt-auth/spec.md`
- **Implementation Plan**: `specs/002-jwt-auth/plan.md`
- **Data Model**: `specs/002-jwt-auth/data-model.md`
- **API Contracts**: `specs/002-jwt-auth/contracts/`
- **Source Code**: `src/features/jwt-auth/`

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review error messages in server logs
3. Verify auth API is accessible
4. Check constants configuration
