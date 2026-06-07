/**
 * Solves the 0/1 Knapsack problem using Dynamic Programming.
 * Selects a subset of tasks that maximizes total Impact without exceeding capacity (MechanicHours).
 * 
 * @param {Array<object>} tasks - Array of maintenance tasks. Each task should have:
 *   - TaskID: string | number
 *   - Duration: number (weight)
 *   - Impact: number (value)
 * @param {number} capacity - The maximum allowed mechanic hours (weight limit).
 * @returns {object} Result containing:
 *   - totalImpact: number (maximum value achieved)
 *   - totalDuration: number (total duration of selected tasks)
 *   - selectedTasks: Array<object> (list of tasks that were chosen)
 */
function solveKnapsack(tasks, capacity) {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0 || capacity <= 0) {
    return {
      totalImpact: 0,
      totalDuration: 0,
      selectedTasks: []
    };
  }

  // Standardize inputs to integers for DP index addressing
  const roundedCapacity = Math.floor(capacity);
  const n = tasks.length;

  // Initialize a 2D dynamic programming table (n + 1) x (capacity + 1)
  const dp = Array.from({ length: n + 1 }, () => new Array(roundedCapacity + 1).fill(0));

  // Populate DP matrix
  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    // Round Duration up to ensure we never exceed hours by underestimating duration
    const duration = Math.max(1, Math.ceil(task.Duration)); 
    const impact = task.Impact;

    for (let w = 0; w <= roundedCapacity; w++) {
      if (duration <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w], 
          dp[i - 1][w - duration] + impact
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Reconstruct selected items from the DP matrix
  let w = roundedCapacity;
  const selectedTasks = [];
  let totalDuration = 0;
  let totalImpact = dp[n][roundedCapacity];

  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      const task = tasks[i - 1];
      selectedTasks.push(task);
      
      const duration = Math.max(1, Math.ceil(task.Duration)); 
      w -= duration;
      totalDuration += task.Duration; // Accumulate actual duration
    }
  }

  // Reverse to preserve the original relative ordering of tasks
  selectedTasks.reverse();

  return {
    totalImpact,
    totalDuration,
    selectedTasks
  };
}

module.exports = {
  solveKnapsack
};
