const depotService = require('./depot.service');
const vehicleService = require('./vehicle.service');
const { solveKnapsack } = require('../utils/knapsack');
const Log = require('logging-middleware');

/**
 * Orchestrates fetching depot and vehicle tasks and runs knapsack optimization for each depot.
 * Optionally accepts custom lists of depots or tasks as overrides.
 * 
 * @param {Array<object>} [customDepots] - Optional override list of depots.
 * @param {Array<object>} [customTasks] - Optional override list of tasks.
 * @returns {Promise<object>} The aggregated optimization result.
 */
async function optimizeMaintenanceSchedule(customDepots = null, customTasks = null) {
  await Log(null, 'INFO', 'scheduler.service', 'Initiating maintenance schedule optimization.');

  // 1. Fetch depots (use custom override if provided, otherwise query service)
  let depots;
  if (customDepots && Array.isArray(customDepots)) {
    await Log(null, 'INFO', 'scheduler.service', `Using ${customDepots.length} custom depots from request body.`);
    depots = customDepots;
  } else {
    depots = await depotService.fetchDepots();
  }

  // 2. Fetch tasks (use custom override if provided, otherwise query service)
  let tasks;
  if (customTasks && Array.isArray(customTasks)) {
    await Log(null, 'INFO', 'scheduler.service', `Using ${customTasks.length} custom tasks from request body.`);
    tasks = customTasks;
  } else {
    tasks = await vehicleService.fetchTasks();
  }

  if (depots.length === 0) {
    await Log(null, 'WARN', 'scheduler.service', 'No depots available to optimize.');
  }
  if (tasks.length === 0) {
    await Log(null, 'WARN', 'scheduler.service', 'No tasks available to assign.');
  }

  // 3. For each depot, solve the 0/1 Knapsack optimization
  const schedule = [];
  let totalImpactAcrossDepots = 0;
  let totalDurationAcrossDepots = 0;

  for (const depot of depots) {
    const depotId = depot.ID || depot.id;
    const mechanicHours = typeof depot.MechanicHours === 'number' ? depot.MechanicHours : depot.mechanicHours || 0;

    if (!depotId) {
      await Log(null, 'WARN', 'scheduler.service', 'Skipping depot with missing ID property.');
      continue;
    }

    // Call dynamic programming utility
    const optimizationResult = solveKnapsack(tasks, mechanicHours);

    schedule.push({
      depotID: depotId,
      mechanicHoursLimit: mechanicHours,
      totalImpact: optimizationResult.totalImpact,
      totalDuration: optimizationResult.totalDuration,
      selectedTasks: optimizationResult.selectedTasks
    });

    totalImpactAcrossDepots += optimizationResult.totalImpact;
    totalDurationAcrossDepots += optimizationResult.totalDuration;
  }

  const result = {
    schedule,
    aggregatedMetrics: {
      totalDepotsProcessed: schedule.length,
      totalImpactAcrossDepots,
      totalDurationAcrossDepots
    }
  };

  await Log(null, 'INFO', 'scheduler.service', `Optimization complete. Processed ${schedule.length} depots with a total impact of ${totalImpactAcrossDepots}.`);
  return result;
}

module.exports = {
  optimizeMaintenanceSchedule
};
