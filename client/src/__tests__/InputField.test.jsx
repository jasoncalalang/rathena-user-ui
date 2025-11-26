import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '../components/InputField';

describe('InputField Component', () => {
  it('should render label and input', () => {
    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        value=""
        onChange={() => {}}
        error="Username is required"
      />
    );

    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        value=""
        onChange={handleChange}
      />
    );

    await user.type(screen.getByRole('textbox'), 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render password input with visibility toggle', async () => {
    const user = userEvent.setup();
    
    render(
      <InputField
        label="Password"
        name="password"
        type="password"
        value="secret"
        onChange={() => {}}
        showToggle
      />
    );

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
  });

  it('should apply error styling when error is present', () => {
    render(
      <InputField
        label="Email"
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        error="Email is required"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red');
  });

  it('should render with maxLength attribute when provided', () => {
    render(
      <InputField
        label="Username"
        name="username"
        type="text"
        value=""
        onChange={() => {}}
        maxLength={23}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '23');
  });
});
