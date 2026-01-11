const serverless = require('serverless-http');
const app = require('../../server'); // Path to your Express app

exports.handler = serverless(app);

