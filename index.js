const { getCachedReport } = require('./create-report');
const { createApi } = require('./api');
const { runServer } = require('./bin');

const api = createApi(getCachedReport);

runServer(api);
