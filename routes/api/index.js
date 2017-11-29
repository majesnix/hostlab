const container = require('./container');


module.exports = (app) => {
  app.use('/api/container', container);
};