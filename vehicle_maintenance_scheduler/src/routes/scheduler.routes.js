const express = require('express');
const router = express.Router();
const schedulerService = require('../services/scheduler.service');

/**
 * @route   POST /api/scheduler/optimize
 * @desc    Run the 0/1 Knapsack optimization for depots using optional overrides
 * @access  Public
 */
router.post('/optimize', async (req, res, next) => {
  try {
    const { depots, tasks } = req.body;
    const result = await schedulerService.optimizeMaintenanceSchedule(depots, tasks);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/scheduler/optimize
 * @desc    Run the 0/1 Knapsack optimization for depots using default fetched data
 * @access  Public
 */
router.get('/optimize', async (req, res, next) => {
  try {
    const result = await schedulerService.optimizeMaintenanceSchedule();
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
