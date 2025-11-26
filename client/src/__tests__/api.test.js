import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { registerUser, checkHealth } from '../services/api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    const validUserData = {
      username: 'testuser',
      password: 'TestPass123',
      email: 'test@example.com',
      sex: 'M',
    };

    it('should return success on successful registration', async () => {
      axios.post.mockResolvedValueOnce({
        status: 201,
        data: {
          result: 'success',
          statusMessage: 'User registered successfully',
        },
      });

      const result = await registerUser(validUserData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User registered successfully');
      expect(axios.post).toHaveBeenCalledWith('/api/register', validUserData);
    });

    it('should return error on 400 bad request', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            result: 'failed',
            statusMessage: 'Missing required field: username',
          },
        },
      });

      const result = await registerUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Missing required field: username');
      expect(result.statusCode).toBe(400);
    });

    it('should return error on 409 conflict', async () => {
      axios.post.mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            result: 'failed',
            statusMessage: 'Username or email already exists',
          },
        },
      });

      const result = await registerUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Username or email already exists');
      expect(result.statusCode).toBe(409);
    });

    it('should return network error on connection failure', async () => {
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      const result = await registerUser(validUserData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to connect to registration server. Please try again later.');
    });
  });

  describe('checkHealth', () => {
    it('should return true when API is healthy', async () => {
      axios.get.mockResolvedValueOnce({
        data: { status: 'ok' },
      });

      const result = await checkHealth();

      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/api/health');
    });

    it('should return false when API is unavailable', async () => {
      axios.get.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await checkHealth();

      expect(result).toBe(false);
    });
  });
});
