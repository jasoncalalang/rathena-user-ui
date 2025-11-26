import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for registration endpoint
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per IP per hour
  message: {
    result: 'failed',
    statusMessage: 'Too many registration attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Health check failed:', error.message);
    }
    res.status(503).json({
      result: 'failed',
      statusMessage: 'API unavailable',
    });
  }
});

// Register user endpoint with rate limiting
app.post('/api/register', registrationLimiter, async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/registerUser`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Registration proxy error:', error.message);
      }
      res.status(500).json({
        result: 'failed',
        statusMessage: 'Proxy server error',
      });
    }
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

export default app;
