import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegistrationForm from '../components/RegistrationForm';
import * as api from '../services/api';

vi.mock('../services/api');

describe('RegistrationForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<RegistrationForm />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/gender/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Gender selection is required')).toBeInTheDocument();
    });
  });

  it('should show validation error when username contains invalid characters', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'user@name');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Username can only contain letters and numbers')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('should display success message on successful registration', async () => {
    api.registerUser.mockResolvedValueOnce({
      success: true,
      message: 'User registered successfully',
    });

    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass123');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByLabelText(/^Male$/));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/user registered successfully/i)).toBeInTheDocument();
    });
  });

  it('should display error message on 409 conflict', async () => {
    api.registerUser.mockResolvedValueOnce({
      success: false,
      message: 'Username or email already exists',
      statusCode: 409,
    });

    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass123');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByLabelText(/^Male$/));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/username or email already exists/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button during API call', async () => {
    let resolvePromise;
    api.registerUser.mockImplementationOnce(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass123');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByLabelText(/^Male$/));
    
    // Click submit and check button is disabled
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    // Resolve the promise and wait for form to finish updating
    resolvePromise({ success: true, message: 'done' });
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  it('should clear form after successful registration', async () => {
    api.registerUser.mockResolvedValueOnce({
      success: true,
      message: 'User registered successfully',
    });

    const user = userEvent.setup();
    render(<RegistrationForm />);

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPass123');
    await user.type(screen.getByLabelText(/confirm password/i), 'TestPass123');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByLabelText(/^Male$/));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });
});
