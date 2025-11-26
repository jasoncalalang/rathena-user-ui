# rAthena User Registration API - Detailed Documentation

## Overview
This document provides comprehensive technical details about the rAthena User Registration API for integration with the UI application. The API is a RESTful service built with Node.js and Express, designed to handle user registration for rAthena (Ragnarok Online private server).

**API Repository**: https://github.com/jasoncalalang/rathena-user-api

## API Base Information

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js v4.21.0
- **Database**: MySQL/MariaDB with connection pooling (mysql2 v3.11.0)
- **Environment**: dotenv for configuration
- **Module System**: ES Modules (type: "module")

### Server Configuration
- **Default Port**: 3000 (configurable via `PORT` environment variable)
- **Content-Type**: `application/json`
- **Database Connection**: Connection pooling with 10 max connections

### Base URL
```
http://localhost:3000
```
*(Replace with production URL when deployed)*

---

## API Endpoints

### 1. User Registration

**Endpoint**: `POST /registerUser`

**Purpose**: Register a new user account in the rAthena system

**Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Max Length | Valid Values | Description |
|-------|------|----------|------------|--------------|-------------|
| `username` | string | Yes | 23 characters | Alphanumeric | Unique account username |
| `password` | string | Yes | No limit | Any string | Account password (will be hashed server-side) |
| `email` | string | Yes | No limit | Valid email format | User's email address (must be unique) |
| `sex` | string | Yes | 1 character | M, F, S | Gender: M (Male), F (Female), S (Server) |

#### Request Example
```json
POST /registerUser
Content-Type: application/json

{
  "username": "playerone",
  "password": "SecurePass123!",
  "email": "player@example.com",
  "sex": "M"
}
```

#### Success Response (201 Created)
```json
{
  "result": "success",
  "statusMessage": "User registered successfully"
}
```

#### Error Responses

**400 Bad Request - Missing Username**
```json
{
  "result": "failed",
  "statusMessage": "Missing required field: username"
}
```

**400 Bad Request - Missing Password**
```json
{
  "result": "failed",
  "statusMessage": "Missing required field: password"
}
```

**400 Bad Request - Missing Email**
```json
{
  "result": "failed",
  "statusMessage": "Missing required field: email"
}
```

**400 Bad Request - Missing Sex**
```json
{
  "result": "failed",
  "statusMessage": "Missing required field: sex"
}
```

**400 Bad Request - Invalid Sex Value**
```json
{
  "result": "failed",
  "statusMessage": "Invalid sex value. Must be M, F, or S"
}
```

**400 Bad Request - Username Too Long**
```json
{
  "result": "failed",
  "statusMessage": "Username must be 23 characters or less"
}
```

**409 Conflict - Username or Email Already Exists**
```json
{
  "result": "failed",
  "statusMessage": "Username or email already exists"
}
```
*(Actual message may vary based on database stored procedure)*

**500 Internal Server Error**
```json
{
  "result": "failed",
  "statusMessage": "Internal server error"
}
```

#### Validation Rules
1. **Username**:
   - Required field
   - Maximum 23 characters
   - Must be unique in the database
   - Case-sensitive

2. **Password**:
   - Required field
   - No client-side length restrictions (handled by rAthena)
   - Recommend enforcing: minimum 8 characters, mix of upper/lower/numbers/special chars in UI

3. **Email**:
   - Required field
   - Must be unique in the database
   - Should be valid email format (validate in UI)
   - Case-insensitive for uniqueness checks

4. **Sex**:
   - Required field
   - Must be exactly one of: 'M', 'F', or 'S'
   - Case-insensitive (converted to uppercase by API)
   - Enum values:
     - `M`: Male character
     - `F`: Female character
     - `S`: Server account (special administrative accounts)

---

### 2. Health Check

**Endpoint**: `GET /health`

**Purpose**: Check if the API server is running and responding

**Authentication**: None required

**Request**: No parameters needed

**Response (200 OK)**:
```json
{
  "status": "ok"
}
```

**Use Case**:
- Frontend application initialization checks
- Load balancer health probes
- Monitoring systems
- Container orchestration health checks

---

## Database Integration

### Database Configuration
The API connects to a MySQL/MariaDB database using environment variables:

```env
DB_HOST=localhost          # Database server hostname/IP
DB_USER=ragnarok          # Database username
DB_PASSWORD=<secret>       # Database password (NEVER expose)
DB_NAME=ragnarok          # Database name
```

### Connection Pool Settings
- **waitForConnections**: true
- **connectionLimit**: 10 concurrent connections
- **queueLimit**: 0 (unlimited queue)

### Stored Procedure: `register_user`

The API uses a MySQL stored procedure for user registration:

```sql
CALL register_user(username, password, email, sex, @result, @message)
```

**Input Parameters**:
1. `username` (VARCHAR) - Account username
2. `password` (VARCHAR) - Plain text password (hashed by procedure)
3. `email` (VARCHAR) - User email
4. `sex` (ENUM/CHAR) - Gender code

**Output Parameters**:
- `@result` (INT) - 1 for success, 0 for failure
- `@message` (VARCHAR) - Status message describing the result

**Database Tables** (inferred from rAthena schema):
- `login` table: Stores account credentials
- Likely includes: `account_id`, `userid` (username), `user_pass`, `email`, `sex`, `group_id`, etc.

---

## UI Integration Guidelines

### Frontend Implementation Recommendations

#### 1. Registration Form Fields

**Username Input**:
```html
<input
  type="text"
  name="username"
  maxlength="23"
  required
  pattern="[A-Za-z0-9]+"
  placeholder="Enter username (max 23 characters)"
/>
```

**Password Input**:
```html
<input
  type="password"
  name="password"
  minlength="8"
  required
  placeholder="Enter password"
/>
```

**Email Input**:
```html
<input
  type="email"
  name="email"
  required
  placeholder="Enter email address"
/>
```

**Gender Selection**:
```html
<select name="sex" required>
  <option value="">Select Gender</option>
  <option value="M">Male</option>
  <option value="F">Female</option>
  <option value="S">Server</option>
</select>
```

#### 2. Frontend Validation (Before API Call)

```javascript
function validateRegistrationForm(formData) {
  const errors = [];

  // Username validation
  if (!formData.username) {
    errors.push('Username is required');
  } else if (formData.username.length > 23) {
    errors.push('Username must be 23 characters or less');
  } else if (!/^[A-Za-z0-9]+$/.test(formData.username)) {
    errors.push('Username can only contain letters and numbers');
  }

  // Password validation
  if (!formData.password) {
    errors.push('Password is required');
  } else if (formData.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  // Email validation
  if (!formData.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push('Please enter a valid email address');
  }

  // Gender validation
  if (!formData.sex) {
    errors.push('Gender selection is required');
  } else if (!['M', 'F', 'S'].includes(formData.sex.toUpperCase())) {
    errors.push('Invalid gender selection');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

#### 3. API Call Implementation

**Using Fetch API**:
```javascript
async function registerUser(formData) {
  try {
    const response = await fetch('http://localhost:3000/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        sex: formData.sex.toUpperCase()
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Success (201)
      return {
        success: true,
        message: data.statusMessage
      };
    } else {
      // Error (400, 409, 500)
      return {
        success: false,
        message: data.statusMessage,
        statusCode: response.status
      };
    }
  } catch (error) {
    // Network error or API unavailable
    return {
      success: false,
      message: 'Unable to connect to registration server. Please try again later.',
      error: error.message
    };
  }
}
```

**Using Axios**:
```javascript
import axios from 'axios';

async function registerUser(formData) {
  try {
    const response = await axios.post('http://localhost:3000/registerUser', {
      username: formData.username,
      password: formData.password,
      email: formData.email,
      sex: formData.sex.toUpperCase()
    });

    return {
      success: true,
      message: response.data.statusMessage
    };
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data.statusMessage,
        statusCode: error.response.status
      };
    } else {
      // Network error
      return {
        success: false,
        message: 'Unable to connect to registration server. Please try again later.',
        error: error.message
      };
    }
  }
}
```

#### 4. Error Handling & User Feedback

```javascript
async function handleRegistration(formData) {
  // Step 1: Frontend validation
  const validation = validateRegistrationForm(formData);
  if (!validation.isValid) {
    displayErrors(validation.errors);
    return;
  }

  // Step 2: Show loading state
  showLoadingSpinner();

  // Step 3: Call API
  const result = await registerUser(formData);

  // Step 4: Hide loading state
  hideLoadingSpinner();

  // Step 5: Handle result
  if (result.success) {
    showSuccessMessage(result.message);
    // Redirect to login page or game download
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  } else {
    showErrorMessage(result.message);

    // Handle specific error cases
    if (result.statusCode === 409) {
      // Username or email already exists
      highlightConflictFields();
    }
  }
}
```

#### 5. User Experience Recommendations

**Loading States**:
- Show spinner/loader during API call
- Disable submit button to prevent double submission
- Display "Creating your account..." message

**Success State**:
- Show success message with checkmark icon
- Display next steps (e.g., "Account created! Redirecting to login...")
- Auto-redirect after 2-3 seconds

**Error States**:
- Display clear, user-friendly error messages
- Highlight specific fields with errors (red border)
- Keep form data intact (don't clear fields on error)
- Never show raw error messages or stack traces

**Security Considerations**:
- Never display which specific field caused a 409 conflict (security)
- Generic message: "Username or email already in use"
- Use HTTPS in production
- Consider implementing CAPTCHA for bot prevention
- Implement rate limiting on frontend (e.g., disable submit for 3 seconds after failed attempt)

---

## API Response Structure

### Standard Response Format

All API responses follow this structure:

```typescript
interface ApiResponse {
  result: 'success' | 'failed';
  statusMessage: string;
}
```

### HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 | OK | Health check successful |
| 201 | Created | User registration successful |
| 400 | Bad Request | Missing required fields, invalid input format |
| 409 | Conflict | Username or email already exists |
| 500 | Internal Server Error | Database error, server crash, unexpected error |

---

## Environment Configuration

### API Environment Variables

Create a `.env` file in the API root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=ragnarok
DB_PASSWORD=your_secure_password_here
DB_NAME=ragnarok

# Server Configuration
PORT=3000
```

### UI Environment Variables (Recommended)

Create a `.env` file in your UI project:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=10000

# Feature Flags
REACT_APP_ENABLE_CAPTCHA=true
REACT_APP_ENABLE_EMAIL_VERIFICATION=false
```

*(Adjust variable names based on your framework: REACT_APP_, VITE_, NEXT_PUBLIC_, etc.)*

---

## Security Best Practices

### Frontend Security

1. **Input Sanitization**:
   - Sanitize all user inputs before sending to API
   - Prevent XSS attacks with proper encoding
   - Use libraries like DOMPurify if rendering user content

2. **Password Handling**:
   - Never log passwords to console
   - Use `type="password"` inputs
   - Consider password strength indicators
   - Never store passwords in localStorage/sessionStorage
   - Password is sent to API (API handles hashing)

3. **CORS Considerations**:
   - API must have proper CORS headers configured
   - In production, whitelist only your UI domain
   - Development: API currently allows all origins (should be restricted)

4. **API Key/Authentication**:
   - Current API has no authentication (public registration endpoint)
   - Consider adding rate limiting
   - Consider adding CAPTCHA/reCAPTCHA
   - Future: Add API key or CSRF token protection

### Backend Security (API)

1. **Environment Variables**:
   - Never commit `.env` file to git (already in .gitignore)
   - Use strong database passwords
   - Rotate credentials regularly

2. **Database**:
   - Uses parameterized queries (SQL injection protected)
   - Uses stored procedures (additional layer of protection)
   - Connection pooling prevents connection exhaustion

3. **Error Handling**:
   - Never exposes database errors to client
   - Returns generic "Internal server error" message
   - Logs detailed errors server-side only

---

## Testing the API

### Manual Testing with cURL

**Health Check**:
```bash
curl -X GET http://localhost:3000/health
```

**Register User**:
```bash
curl -X POST http://localhost:3000/registerUser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testplayer",
    "password": "TestPass123",
    "email": "test@example.com",
    "sex": "M"
  }'
```

### Testing with Postman

1. Create new request
2. Set method to `POST`
3. Set URL to `http://localhost:3000/registerUser`
4. Go to Headers tab: Add `Content-Type: application/json`
5. Go to Body tab: Select `raw` and `JSON`
6. Paste JSON request body
7. Click Send

### Integration Testing from UI

```javascript
// Test function to verify API connectivity
async function testApiConnection() {
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();

    if (data.status === 'ok') {
      console.log('✅ API connection successful');
      return true;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Run on app initialization
testApiConnection();
```

---

## Common Integration Issues & Solutions

### Issue 1: CORS Errors

**Error**: `Access to fetch at 'http://localhost:3000/registerUser' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**: API needs to add CORS middleware:
```javascript
// In app.js
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173', // Your UI URL
  credentials: true
}));
```

### Issue 2: Network Error / API Unavailable

**Error**: `TypeError: Failed to fetch`

**Checklist**:
- ✅ Is the API server running? (`npm start` in API directory)
- ✅ Is the API on correct port? (Check PORT in .env)
- ✅ Is the API URL correct in UI? (http://localhost:3000)
- ✅ Is database connected? (Check API console for DB errors)

### Issue 3: 500 Internal Server Error

**Possible Causes**:
- Database connection failed (wrong credentials in .env)
- Database server not running
- Stored procedure `register_user` doesn't exist
- Database schema mismatch

**Debug Steps**:
1. Check API console/logs for error details
2. Verify database connection: `mysql -u ragnarok -p`
3. Verify stored procedure exists: `SHOW PROCEDURE STATUS WHERE Db = 'ragnarok';`

---

## API Limitations & Future Enhancements

### Current Limitations

1. **No Authentication**: Registration endpoint is public (anyone can call it)
2. **No Rate Limiting**: Vulnerable to spam/bot registrations
3. **No Email Verification**: Users can register with fake emails
4. **No CAPTCHA**: Bots can automate registrations
5. **No Username Format Validation**: Allows any alphanumeric (could add restrictions)
6. **No Password Strength Enforcement**: API accepts any password (should enforce complexity)
7. **No Account Activation**: Accounts are immediately active

### Recommended Enhancements

1. **Email Verification System**:
   - Send verification email after registration
   - Add `email_verified` flag to database
   - Add `/verify-email` endpoint

2. **Rate Limiting**:
   - Limit to 5 registration attempts per IP per hour
   - Use libraries like `express-rate-limit`

3. **CAPTCHA Integration**:
   - Add Google reCAPTCHA v3
   - Verify CAPTCHA token on server side

4. **Password Policy**:
   - Minimum 8 characters
   - At least one uppercase, lowercase, number, special char
   - Check against common password lists

5. **Username Restrictions**:
   - Block offensive/reserved usernames
   - Minimum length requirement (e.g., 3 characters)
   - Block confusing characters (e.g., l vs I, 0 vs O)

6. **Audit Logging**:
   - Log all registration attempts (success/failure)
   - Track IP addresses
   - Monitor for suspicious patterns

---

## Quick Reference

### API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/registerUser` | Register new user account | No |
| GET | `/health` | Health check | No |

### Required Request Headers

```
Content-Type: application/json
```

### Response Structure

```json
{
  "result": "success" | "failed",
  "statusMessage": "string"
}
```

### Status Codes Cheat Sheet

- `200` → Health check OK
- `201` → User created successfully
- `400` → Bad request (validation error)
- `409` → Conflict (duplicate username/email)
- `500` → Server error (check logs)

---

## Support & Resources

### API Repository
https://github.com/jasoncalalang/rathena-user-api

### rAthena Documentation
- Official Site: https://rathena.org/
- GitHub: https://github.com/rathena/rathena
- Wiki: https://github.com/rathena/rathena/wiki

### Contact
For API issues, create a GitHub issue in the repository above.

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- POST /registerUser endpoint
- GET /health endpoint
- MySQL stored procedure integration
- Basic validation
- Error handling
