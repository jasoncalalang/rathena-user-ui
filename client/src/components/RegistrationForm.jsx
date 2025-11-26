import { useState } from 'react';
import InputField from './InputField';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import { validateForm } from '../utils/validation';
import { registerUser } from '../services/api';

const initialFormData = {
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  sex: '',
};

export default function RegistrationForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    const validation = validateForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await registerUser({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        sex: formData.sex.toUpperCase(),
      });

      if (result.success) {
        setSuccessMessage(result.message);
        setFormData(initialFormData);
      } else {
        setErrorMessage(result.message);
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the adventure today</p>
        </div>

        <SuccessMessage 
          message={successMessage} 
          onClose={() => setSuccessMessage('')} 
        />
        <ErrorMessage 
          message={errorMessage} 
          onClose={() => setErrorMessage('')} 
        />

        <form onSubmit={handleSubmit} noValidate>
          <InputField
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="Enter username (max 23 characters)"
            maxLength={23}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter password (min 8 characters)"
            showToggle
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            showToggle
          />

          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email address"
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex gap-6">
              {[
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'S', label: 'Server' },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="radio"
                    name="sex"
                    value={option.value}
                    checked={formData.sex === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    aria-label={option.label}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.sex && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.sex}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
