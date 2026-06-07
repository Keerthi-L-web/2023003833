const axios = require('axios');

let cachedToken = process.env.ACCESS_TOKEN || null;
let tokenExpiry = null;

/**
 * Retrieves an access token from the evaluation service using environment credentials.
 * Utilizes in-memory caching to avoid repeated authentication requests.
 * 
 * @returns {Promise<string>} The access token.
 */
async function getAccessToken() {
  // 1. If static ACCESS_TOKEN is provided directly in env, prioritize and return it
  if (process.env.ACCESS_TOKEN) {
    return process.env.ACCESS_TOKEN;
  }

  // 2. Return cached token if it exists and has not expired
  if (cachedToken && (!tokenExpiry || tokenExpiry > Date.now())) {
    return cachedToken;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const authUrl = process.env.EVALUATION_AUTH_URL;

  // 3. Fallback to mock token if credentials are not provided
  if (!clientId || !clientSecret) {
    console.warn('[Logger-Auth] Missing CLIENT_ID or CLIENT_SECRET. Falling back to mock token.');
    return 'mock-access-token-no-credentials';
  }

  // 4. Fallback to mock token if auth URL is not provided
  if (!authUrl) {
    console.warn('[Logger-Auth] EVALUATION_AUTH_URL not configured. Falling back to mock token.');
    return 'mock-access-token-no-auth-url';
  }

  try {
    const response = await axios.post(authUrl, {
      client_id: clientId,
      client_secret: clientSecret
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    if (response.data && response.data.access_token) {
      cachedToken = response.data.access_token;
      
      // Calculate token expiration time if expires_in is provided (in seconds)
      if (response.data.expires_in) {
        const bufferSeconds = 60; // 1-minute buffer
        tokenExpiry = Date.now() + (response.data.expires_in - bufferSeconds) * 1000;
      }
      return cachedToken;
    } else {
      throw new Error('Authentication response did not return an access_token.');
    }
  } catch (error) {
    console.error(`[Logger-Auth] Authentication request failed: ${error.message}. Falling back to mock token.`);
    // Fall back to a mock token to ensure the app continues to operate
    return 'mock-access-token-auth-failed';
  }
}

module.exports = {
  getAccessToken
};
