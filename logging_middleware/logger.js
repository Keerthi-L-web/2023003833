const axios = require('axios');
const auth = require('./auth');

/**
 * Sends a log entry to the evaluation service's logging API.
 * 
 * @param {string} stack - The error stack trace or call stack context.
 * @param {string} level - The severity level of the log (e.g. INFO, WARN, ERROR).
 * @param {string} packageName - The name of the package/module generating the log.
 * @param {string} message - The log message text.
 * @returns {Promise<object>} The server response or status payload.
 */
async function Log(stack, level, packageName, message) {
  const loggingUrl = process.env.LOGGING_API_URL;
  const timestamp = new Date().toISOString();

  const logPayload = {
    timestamp,
    level: level ? level.toUpperCase() : 'INFO',
    packageName: packageName || 'unknown-package',
    message: message || '',
    stack: stack || null
  };

  // 1. Output to local console for developer visibility
  const consoleMethod = logPayload.level === 'ERROR' ? 'error' : logPayload.level === 'WARN' ? 'warn' : 'log';
  console[consoleMethod](`[${timestamp}] [${logPayload.level}] [${logPayload.packageName}]: ${logPayload.message}`);
  if (logPayload.stack && logPayload.level === 'ERROR') {
    console.error(logPayload.stack);
  }

  // 2. If LOGGING_API_URL is not set, treat console as the primary destination
  if (!loggingUrl) {
    return { success: true, status: 'Logged to console (LOGGING_API_URL not configured)' };
  }

  // 3. Send log payload to the evaluation service logging API
  try {
    const token = await auth.getAccessToken();
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(loggingUrl, logPayload, {
      headers,
      timeout: 5000 // 5-second timeout to prevent stalling the main thread
    });

    return response.data;
  } catch (error) {
    // 4. Implement robust error handling to prevent logging failures from crashing the host application
    console.error('[Logger-API] Failed to transmit log to API:', error.message);
    if (error.response) {
      console.error('[Logger-API] API Response Status:', error.response.status);
      console.error('[Logger-API] API Response Data:', JSON.stringify(error.response.data));
    }
    return { success: false, error: error.message };
  }
}

module.exports = Log;
