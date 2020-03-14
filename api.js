const express = require('express');

/**
 * Creates api routes using the dependency getReport.
 * @param {() => Promise<{ streamedSecondsPerUser: { [key: string]: number }, revenueDistribution: any }>} getReport
 * @returns {Express.Application}
 */
function createApi (getReport) {
  const app = express();

  app.get('/users/:userId', (req, res) => {
    getReport().then(({ streamedSecondsPerUser }) => {
      const {userId} = req.params;
      if (!(userId in streamedSecondsPerUser)) {
        return res.status(404).json({
          error: 'not_found',
        });
      }

      res.json({
        user_id: userId,
        total_seconds: streamedSecondsPerUser[userId],
      });
    });
  });

  app.get('/report', (req, res) => {
    getReport().then(({ revenueDistribution }) => res.json(revenueDistribution));
  });

  return app;
}

module.exports = {
  createApi,
};
