const config = require('./config.json');

/**
 * 
 * @param {Express.Application} app 
 */
function runServer(app) {
  app.listen(config.port, () => { console.log(`app server started on ${config.port}`)});
}

module.exports = {
  runServer,
};
