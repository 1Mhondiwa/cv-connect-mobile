// Configuration file for CV-Connect Mobile App
import Constants from 'expo-constants';

// Get the environment from Expo constants
const environment = Constants.expoConfig?.extra?.environment || 'development';

// Configuration for different environments
const configs = {
  development: {
    API_BASE_URL: 'http://10.0.0.16:5000/api', // Local development server (Expo IP)
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.cv-connect.com/api', // Staging server
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  production: {
    API_BASE_URL: 'https://api.cv-connect.com/api', // Production server
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  }
};

// Get current configuration
const config = configs[environment] || configs.development;

// Validate configuration
if (!config.API_BASE_URL) {
  throw new Error(`API_BASE_URL is not configured for environment: ${environment}`);
}

// Export configuration
export default {
  ...config,
  environment,
  isDevelopment: environment === 'development',
  isStaging: environment === 'staging',
  isProduction: environment === 'production',
};

// Export individual config values for convenience
export const {
  API_BASE_URL,
  TIMEOUT,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  environment: ENVIRONMENT,
  isDevelopment,
  isStaging,
  isProduction
} = config;
