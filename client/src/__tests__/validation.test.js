import { describe, it, expect } from 'vitest';
import { validateUsername, validatePassword, validateEmail, validateSex, validateForm } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateUsername', () => {
    it('should return error for empty username', () => {
      expect(validateUsername('')).toBe('Username is required');
    });

    it('should return error for username over 23 characters', () => {
      const longUsername = 'a'.repeat(24);
      expect(validateUsername(longUsername)).toBe('Username must be 23 characters or less');
    });

    it('should return error for non-alphanumeric characters', () => {
      expect(validateUsername('user@name')).toBe('Username can only contain letters and numbers');
    });

    it('should return null for valid username', () => {
      expect(validateUsername('validUser123')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('should return error for password under 8 characters', () => {
      expect(validatePassword('short')).toBe('Password must be at least 8 characters');
    });

    it('should return null for valid password', () => {
      expect(validatePassword('validPass123')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('should return error for invalid email format', () => {
      expect(validateEmail('invalid')).toBe('Please enter a valid email address');
      expect(validateEmail('invalid@')).toBe('Please enter a valid email address');
      expect(validateEmail('@invalid.com')).toBe('Please enter a valid email address');
    });

    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
    });
  });

  describe('validateSex', () => {
    it('should return error for empty sex', () => {
      expect(validateSex('')).toBe('Gender selection is required');
    });

    it('should return error for invalid sex value', () => {
      expect(validateSex('X')).toBe('Invalid gender selection');
    });

    it('should return null for valid sex values', () => {
      expect(validateSex('M')).toBeNull();
      expect(validateSex('F')).toBeNull();
      expect(validateSex('S')).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should return all errors for empty form', () => {
      const result = validateForm({
        username: '',
        password: '',
        email: '',
        sex: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
      expect(result.errors.password).toBe('Password is required');
      expect(result.errors.email).toBe('Email is required');
      expect(result.errors.sex).toBe('Gender selection is required');
    });

    it('should return empty errors object for valid form', () => {
      const result = validateForm({
        username: 'testuser',
        password: 'TestPass123',
        email: 'test@example.com',
        sex: 'M',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should validate password confirmation if provided', () => {
      const result = validateForm({
        username: 'testuser',
        password: 'TestPass123',
        confirmPassword: 'DifferentPass',
        email: 'test@example.com',
        sex: 'M',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match');
    });
  });
});
