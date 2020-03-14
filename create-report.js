const {
  trackMetadataUrl,
  usersDataPath,
  streamingDataPath,
  webRevenue,
  appStoreRevenue
} = require('./config.json');

const {
  parseStreamingData,
  parseTracksMetadata,
  parseUserData
} = require('./parsers');

const {
  getDistributionOfRevenue,
  getStreamedSecondsPerUser,
  getTotalRevenue
} = require('./report-helpers');

function createReport () {
  return Promise.all([
    parseUserData(usersDataPath),
    parseTracksMetadata(trackMetadataUrl)
  ])
  .then(([userData, tracksMetadata]) => Promise.all([parseStreamingData(streamingDataPath, userData, tracksMetadata), userData, tracksMetadata]))
  .then(([ streamingData, userData, tracksMetadata ]) => {
    const totalRevenue = getTotalRevenue(userData, webRevenue, appStoreRevenue);
  
    return {
      revenueDistribution: getDistributionOfRevenue(streamingData, totalRevenue),
      streamedSecondsPerUser: getStreamedSecondsPerUser(streamingData),
    }
  });
}

let cache = null;
function getCachedReport () {
  return new Promise((resolve) => {
    if (cache) {
      return resolve(cache);
    }

    createReport().then(report => {
      cache = report;
      resolve(report);
    });
  });
}

module.exports = {
  createReport,
  getCachedReport,
};
