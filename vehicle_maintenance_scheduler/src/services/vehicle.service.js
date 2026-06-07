const axios = require('axios');
const Log = require('logging-middleware');

const MOCK_TASKS = [
  { TaskID: 'TASK-001', Duration: 3, Impact: 30 },
  { TaskID: 'TASK-002', Duration: 4, Impact: 50 },
  { TaskID: 'TASK-003', Duration: 5, Impact: 60 },
  { TaskID: 'TASK-004', Duration: 2, Impact: 20 },
  { TaskID: 'TASK-005', Duration: 6, Impact: 40 },
  { TaskID: 'TASK-006', Duration: 8, Impact: 75 }
];

/**
 * Fetches the list of vehicle maintenance tasks from the external Tasks API.
 * 
 * @returns {Promise<Array<object>>} List of maintenance tasks.
 */
async function fetchTasks() {
  const url = process.env.TASKS_API_URL;
  const useFallback = process.env.USE_MOCK_FALLBACK === 'true';

  await Log(null, 'INFO', 'vehicle.service', `Fetching vehicle maintenance tasks from API: ${url}`);

  if (!url) {
    if (useFallback) {
      await Log(null, 'WARN', 'vehicle.service', 'TASKS_API_URL not configured. Returning mock tasks fallback.');
      return MOCK_TASKS;
    }
    throw new Error('TASKS_API_URL is not configured and mock fallback is disabled.');
  }

  try {
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && Array.isArray(response.data)) {
      await Log(null, 'INFO', 'vehicle.service', `Successfully fetched ${response.data.length} tasks from API.`);
      return response.data;
    }

    const data = response.data.tasks || response.data.data || response.data;
    if (Array.isArray(data)) {
      await Log(null, 'INFO', 'vehicle.service', `Successfully fetched ${data.length} tasks from API structure wrapper.`);
      return data;
    }

    throw new Error('Response data is not in an array format.');
  } catch (error) {
    await Log(error.stack, 'ERROR', 'vehicle.service', `Failed to fetch tasks from API: ${error.message}`);
    
    if (useFallback) {
      await Log(null, 'WARN', 'vehicle.service', 'Returning mock tasks fallback due to API failure.');
      return MOCK_TASKS;
    }
    
    throw error;
  }
}

module.exports = {
  fetchTasks,
  MOCK_TASKS
};
