import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(503).json({
      result: 'failed',
      statusMessage: 'API unavailable',
    });
  }
});

// Register user endpoint
app.post('/api/register', async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/registerUser`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
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
