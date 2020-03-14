/**
 * Gets the disposable revenue value based on users paid fees and product types
 * @param {{ [key: string]: { user_id: string, product_type: 'premium' | 'platinum', fee: number, origin: 'web' | 'app_store' } }} userData 
 * @param {number} webRevenue
 * @param {number} appStoreRevenue
 * 
 * @returns {number} total revenue amount
 */
function getTotalRevenue (userData, webRevenue, appStoreRevenue) {
  return Object.values(userData).reduce(( revenue, user ) => {
    const contribution = user.fee * (user.origin === 'app_store' ? appStoreRevenue : webRevenue);
    return revenue + contribution;
  }, 0);
}

/**
 * Returns a distribution of revenue per label
 * @param {Array<{date: string,region: string,seconds: number,user_id: string,product_type: 'platinum' | 'premium',fee: number,origin: 'web' | 'app_store',track_id: string,track_name: string,track_label: string}>} streamingData 
 * @param {number} totalRevenue 
 */
function getDistributionOfRevenue (streamingData, totalRevenue) {
  const { secondsPerLabel, totalSeconds } = streamingData.reduce(( acc, stream ) => {
    acc.secondsPerLabel[stream.track_label] = (acc.secondsPerLabel[stream.track_label] || 0) + stream.seconds;
    acc.totalSeconds += stream.seconds;

    return acc;
  }, { secondsPerLabel: {}, totalSeconds: 0 });

  return Object.keys(secondsPerLabel).reduce(( dist, label ) => {
    dist[label] = secondsPerLabel[label] / totalSeconds * totalRevenue;
    return dist;
  }, {});
}

/**
 * Returns a map user -> total played seconds based on streaming data
 * 
 * @param {Array<{date: string,region: string,seconds: number,user_id: string,product_type: 'platinum' | 'premium',fee: number,origin: 'web' | 'app_store',track_id: string,track_name: string,track_label: string}>} streamingData
 * @returns {{ [key: string]: number }}
 */
function getStreamedSecondsPerUser (streamingData) {
  return streamingData.reduce(( acc, stream ) => {
    acc[stream.user_id] = (acc[stream.user_id] || 0) + stream.seconds;
    return acc;
  }, {});
}

module.exports = {
  getTotalRevenue,
  getDistributionOfRevenue,
  getStreamedSecondsPerUser,
}
