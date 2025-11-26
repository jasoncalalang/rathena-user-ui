export function validateUsername(username) {
  if (!username) {
    return 'Username is required';
  }
  if (username.length > 23) {
    return 'Username must be 23 characters or less';
  }
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    return 'Username can only contain letters and numbers';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validateSex(sex) {
  if (!sex) {
    return 'Gender selection is required';
  }
  if (!['M', 'F', 'S'].includes(sex.toUpperCase())) {
    return 'Invalid gender selection';
  }
  return null;
}

export function validateForm(formData) {
  const errors = {};
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const sexError = validateSex(formData.sex);
  if (sexError) errors.sex = sexError;
  
  // Check password confirmation if provided
  if (formData.confirmPassword !== undefined && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
