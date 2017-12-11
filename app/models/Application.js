const Sequelize = require('sequelize');

module.exports.attributes = {
  projectid: {
    type: Sequelize.INTEGER,
    field: 'project_id',
    references: { 
      model: 'projects',
      key: 'id',
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  port: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false,
  }
};

module.exports.options = {
  freezeTableName: true
};