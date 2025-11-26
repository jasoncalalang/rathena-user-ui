import axios from 'axios';

export async function registerUser(formData) {
  try {
    const response = await axios.post('/api/register', formData);
    return {
      success: true,
      message: response.data.statusMessage,
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.statusMessage,
        statusCode: error.response.status,
      };
    }
    return {
      success: false,
      message: 'Unable to connect to registration server. Please try again later.',
    };
  }
}

export async function checkHealth() {
  try {
    const response = await axios.get('/api/health');
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}
