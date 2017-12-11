const Sequelize = require('sequelize');

module.exports.attributes = {
  projectid: {
    type: Sequelize.INTEGER,
    references: { 
      model: 'projects',
      key: 'id',
    }
  },
  userid: {
    type: Sequelize.STRING,
    references: {
      model: 'users',
      key: 'matr_nr',
    }
  }
};

module.exports.options = {
  freezeTableName: true
};