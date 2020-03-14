const fs = require('fs');

const CsvReadableStream = require('csv-reader');
const axios = require('axios').default;


function getCsvReadableStream(path) {
  return fs
    .createReadStream(path, 'utf8')
    .pipe(new CsvReadableStream({ delimiter: ';', asObject: true }));
}

/**
 * Goes through the csv file, returns a map of user ids to their data asynchronously.
 * 
 * @param {string} userDataPath file path where the user data is
 * @returns {Promise<{ [key: string]: { user_id: string, product_type: 'premium' | 'platinum', fee: number, origin: 'web' | 'app_store' } }>}
 */
function parseUserData (userDataPath) {
  return new Promise((resolve) => {
    let parsedUserData = {};
    
    getCsvReadableStream(userDataPath)
      .on('data', ({ user_id, product_type, fee, origin }) =>  {
        parsedUserData[user_id] = {
          user_id,
          product_type,
          fee: parseFloat(fee.replace(',', '.')),
          origin,
        }
      })
      .on('end', () => resolve(parsedUserData));
  });
}

/**
 * Gets the tracks metadata from metadataUrl and groups it by track id.
 * 
 * @param {string} metadataUrl
 * @returns {Promise<{ [key: string] : { track_id: string, track_name: string, track_label: string } }>}
 */
function parseTracksMetadata (metadataUrl) {
  const TRACK_ID_FIELD = 'track_id';
  const TRACK_NAME_FIELD = 'track name 1';
  const TRACK_LABEL_FIELD = 'label 1';

  return axios.get(metadataUrl).then((response) => 
    response.data.reduce(( parsedMetadata, currentTrack ) => {
      const track_id = currentTrack[TRACK_ID_FIELD];
      const track_name = currentTrack[TRACK_NAME_FIELD];
      const track_label = currentTrack[TRACK_LABEL_FIELD];

      parsedMetadata[track_id] = {
        track_id,
        track_name,
        track_label,
      };

      return parsedMetadata;
    }, {})
  );
}

/**
 * 
 * @param {string} streamingDataPath 
 * @param {{ [key: string]: { user_id: string, product_type: 'premium' | 'platinum', fee: number, origin: 'web' | 'app_store' } }} userData 
 * @param {{ [key: string] : { track_id: string, track_name: string, track_label: string } }} tracksMetadata 
 * 
 * @returns {Promise<Array<{date: string,region: string,seconds: number,user_id: string,product_type: 'platinum' | 'premium',fee: number,origin: 'web' | 'app_store',track_id: string,track_name: string,track_label: string}>>}
 */
function parseStreamingData (
  streamingDataPath,
  userData,
  tracksMetadata,
) {
  const TRACK_ID_COLUMN = 'track id';
  
  return new Promise((resolve) => {
    const consolidatedData = [];
    const streamingReadableStream = getCsvReadableStream(streamingDataPath);

    streamingReadableStream.on('data', (row) => {
      const {
        date,
        user_id,
        region,
        seconds
      } = row;
      const track_id = row[TRACK_ID_COLUMN];

      consolidatedData.push({
        date,
        region,
        seconds: parseInt(seconds, 10),
        ...userData[user_id],
        ...tracksMetadata[track_id],
      });
    }).on('end', () => resolve(consolidatedData));
  });
}

module.exports = {
  parseStreamingData,
  parseTracksMetadata,
  parseUserData,
}
