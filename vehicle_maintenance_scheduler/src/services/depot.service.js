const axios = require('axios');
const Log = require('logging-middleware');

const MOCK_DEPOTS = [
  { ID: 'DEPOT-001', MechanicHours: 10 },
  { ID: 'DEPOT-002', MechanicHours: 15 },
  { ID: 'DEPOT-003', MechanicHours: 25 },
  { ID: 'DEPOT-004', MechanicHours: 5 }
];

/**
 * Fetches the list of depots from the external Depots API.
 * 
 * @returns {Promise<Array<object>>} List of depots.
 */
async function fetchDepots() {
  const url = process.env.DEPOTS_API_URL;
  const useFallback = process.env.USE_MOCK_FALLBACK === 'true';

  await Log(null, 'INFO', 'depot.service', `Fetching depots from API: ${url}`);

  if (!url) {
    if (useFallback) {
      await Log(null, 'WARN', 'depot.service', 'DEPOTS_API_URL not configured. Returning mock depots fallback.');
      return MOCK_DEPOTS;
    }
    throw new Error('DEPOTS_API_URL is not configured and mock fallback is disabled.');
  }

  try {
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && Array.isArray(response.data)) {
      await Log(null, 'INFO', 'depot.service', `Successfully fetched ${response.data.length} depots from API.`);
      return response.data;
    }
    
    // In some cases, APIs might wrap the array in an object
    const data = response.data.depots || response.data.data || response.data;
    if (Array.isArray(data)) {
      await Log(null, 'INFO', 'depot.service', `Successfully fetched ${data.length} depots from API structure wrapper.`);
      return data;
    }

    throw new Error('Response data is not in an array format.');
  } catch (error) {
    await Log(error.stack, 'ERROR', 'depot.service', `Failed to fetch depots from API: ${error.message}`);
    
    if (useFallback) {
      await Log(null, 'WARN', 'depot.service', 'Returning mock depots fallback due to API failure.');
      return MOCK_DEPOTS;
    }
    
    throw error;
  }
}

module.exports = {
  fetchDepots,
  MOCK_DEPOTS
};
