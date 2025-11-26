import request from 'supertest';
import { jest } from '@jest/globals';

// Mock axios before importing app
jest.unstable_mockModule('axios', () => ({
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Express Proxy Server', () => {
  let app;
  let axios;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Dynamic import after mocking
    const axiosModule = await import('axios');
    axios = axiosModule.default;
    const appModule = await import('../app.js');
    app = appModule.default;
  });

  describe('GET /api/health', () => {
    it('should return health status when API is healthy', async () => {
      axios.get.mockResolvedValueOnce({
        status: 200,
        data: { status: 'ok' },
      });

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return 503 when API is unavailable', async () => {
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body.result).toBe('failed');
      expect(response.body.statusMessage).toContain('API unavailable');
    });
  });

  describe('POST /api/register', () => {
    const validUserData = {
      username: 'testuser',
      password: 'TestPass123',
      email: 'test@example.com',
      sex: 'M',
    };

    it('should forward registration request to API and return 201 on success', async () => {
      axios.post.mockResolvedValueOnce({
        status: 201,
        data: {
          result: 'success',
          statusMessage: 'User registered successfully',
        },
      });

      const response = await request(app)
        .post('/api/register')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.result).toBe('success');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/registerUser'),
        validUserData
      );
    });

    it('should return 400 for missing required fields', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            result: 'failed',
            statusMessage: 'Missing required field: username',
          },
        },
      });

      const response = await request(app)
        .post('/api/register')
        .send({ password: 'test', email: 'test@test.com', sex: 'M' });

      expect(response.status).toBe(400);
      expect(response.body.result).toBe('failed');
    });

    it('should return 409 for duplicate username or email', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            result: 'failed',
            statusMessage: 'Username or email already exists',
          },
        },
      });

      const response = await request(app)
        .post('/api/register')
        .send(validUserData);

      expect(response.status).toBe(409);
      expect(response.body.result).toBe('failed');
      expect(response.body.statusMessage).toContain('already exists');
    });

    it('should return 500 when API is unavailable', async () => {
      axios.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      const response = await request(app)
        .post('/api/register')
        .send(validUserData);

      expect(response.status).toBe(500);
      expect(response.body.result).toBe('failed');
      expect(response.body.statusMessage).toBe('Proxy server error');
    });
  });
});
