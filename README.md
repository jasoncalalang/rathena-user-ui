# rAthena User Registration UI

A modern, responsive user registration interface built with React and Tailwind CSS, with an Express.js proxy layer to communicate with the rAthena User Registration API.

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Browser   │─────▶│  Express Proxy   │─────▶│  rAthena User    │
│  (React UI) │      │  (Port 3001)     │      │  API (Port 3000) │
└─────────────┘      └──────────────────┘      └──────────────────┘
```

## Technology Stack

### Frontend
- React 19
- Tailwind CSS 4
- React Hook Form
- Axios
- Vitest + React Testing Library

### Backend (Proxy Layer)
- Express.js
- CORS middleware
- dotenv for configuration
- Jest + Supertest

### Containerization
- Docker with node:alpine3.21
- Docker Compose

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/jasoncalalang/rathena-user-ui.git
   cd rathena-user-ui
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   cd ..

   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**

   In one terminal (Express proxy):
   ```bash
   cd server
   npm run dev
   ```

   In another terminal (React dev server):
   ```bash
   cd client
   npm run dev
   ```

5. **Open the application**
   - React UI: http://localhost:5173
   - Express Proxy: http://localhost:3001

### Running Tests

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build the container
docker-compose -f docker-compose.yml build

# Start the services
docker-compose -f docker-compose.yml up -d
```

### Build Docker Image Manually

```bash
docker build -f docker/Dockerfile -t rathena-user-ui .
```

### Run Container

```bash
docker run -p 3001:3001 -e API_URL=http://your-api:3000 rathena-user-ui
```

## Project Structure

```
rathena-user-ui/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── services/           # API service
│   │   ├── utils/              # Validation utilities
│   │   ├── __tests__/          # Tests
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express proxy
│   ├── __tests__/              # Tests
│   ├── app.js                  # Express app
│   ├── index.js                # Server entry point
│   └── package.json
├── docker/
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── CLAUDE.md                   # API documentation
└── README.md
```

## API Endpoints

### Express Proxy Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (proxies to API `/health`) |
| POST | `/api/register` | Register user (proxies to API `/registerUser`) |

### Registration Request

```json
POST /api/register
{
  "username": "playerone",
  "password": "SecurePass123!",
  "email": "player@example.com",
  "sex": "M"
}
```

### Validation Rules

- **Username**: Required, max 23 characters, alphanumeric only
- **Password**: Required, min 8 characters
- **Email**: Required, valid email format
- **Sex**: Required, one of: M (Male), F (Female), S (Server)

## Features

- ✅ Modern, responsive UI design
- ✅ Real-time form validation
- ✅ Password visibility toggle
- ✅ Loading states during submission
- ✅ Success/error message feedback
- ✅ Accessible (WCAG 2.1 Level AA)
- ✅ Mobile-first responsive design
- ✅ Express proxy for CORS handling
- ✅ Rate limiting on registration endpoint
- ✅ Comprehensive test coverage
- ✅ Docker containerization

## Security Features

- **Rate Limiting**: 5 registration attempts per IP per hour
- **CORS Protection**: Configured to allow cross-origin requests
- **Input Validation**: Client-side and server-side validation
- **Error Handling**: Sensitive errors logged server-side only
- **Non-root User**: Docker container runs as non-root user

## License

MIT
