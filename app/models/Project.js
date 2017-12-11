const Sequelize = require('sequelize');

module.exports.attributes = {
  userid: {
    type: Sequelize.STRING,
    field: 'user_id',
    references: { 
      model: 'users',
      key: 'matr_nr',
    }
  },
  name: {
    type: Sequelize.STRING,
  },
  gitlabid: {
    type: Sequelize.INTEGER,
    field: 'gitlab_id',
  },
  appquota: {
    type: Sequelize.INTEGER,
    field: 'app_quota',
    defaultValue: 0,
  },
  dbquota: {
    type: Sequelize.INTEGER,
    field: 'db_quota',
    defaultValue: 0,
  }
};

module.exports.options = {
  freezeTableName: true
};