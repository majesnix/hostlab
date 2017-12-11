const Sequelize = require('sequelize');
const { dbURL } = require('../config'); 
const sequelize = new Sequelize(dbURL, { logging: false, operatorsAliases: Sequelize.Op });
const UserMeta = require('./models/User');
const ProjectMeta = require('./models/Project');
const ProjectParticipantsMeta = require('./models/ProjectParticipants');
const ApplicationMeta = require('./models/Application');
const DatabaseMeta = require('./models/Database');


const User = sequelize.define('users', UserMeta.attributes, UserMeta.options);
const Project = sequelize.define('projects', ProjectMeta.attributes, ProjectMeta.options);
const ProjectParticipants = sequelize.define('projectparticipants', ProjectParticipantsMeta.attributes, ProjectParticipantsMeta.options);
const Applications = sequelize.define('applications', ApplicationMeta.attributes, ApplicationMeta.options);
const Databases = sequelize.define('databases', DatabaseMeta.attributes, DatabaseMeta.options);

// authenticate with the database
sequelize.authenticate()
  .then(async () => {
    // check if db exists, otherwise create it
    await User.sync();
    await Project.sync();
    await ProjectParticipants.sync();
    await Applications.sync();
    await Databases.sync();
    // relations
    User.hasMany(Project, { foreignKey: 'userid' });
    User.hasMany(ProjectParticipants, { foreignKey: 'users' });
    Project.hasMany(ProjectParticipants, { foreignKey: 'projects' });
    Applications.belongsTo(Project);
    Databases.belongsTo(Project);
  })
  .catch(err => {
    console.error('Unable to connect to the database: ', err);
  });

module.exports = sequelize;