const UserMeta = require('./models/User');
const ProjectMeta = require('./models/Project');
const ProjectParticipantsMeta = require('./models/ProjectParticipants');
const ApplicationMeta = require('./models/Application');
const DatabaseMeta = require('./models/Database');
const connection = require('./sequelize');

module.exports.User = connection.define('users', UserMeta.attributes, UserMeta.options);

module.exports.Project = connection.define('projects', ProjectMeta.attributes, ProjectMeta.options);

module.exports.ProjectParticipant = connection.define('projectparticipants', ProjectParticipantsMeta.attributes, ProjectParticipantsMeta.options);

module.exports.Application = connection.define('applications', ApplicationMeta.attributes, ApplicationMeta.options);

module.exports.Database = connection.define('databases', DatabaseMeta.attributes, DatabaseMeta.options);