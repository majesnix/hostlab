// login
var login = require('./login');

// dashboard
var dashboard = require('./dashboard');

// help
var help = require('./help/index');

// cronjobs
const cronjobs = require('./cronjobs/index');

// databases
const databases = require('./databases/index');
const postgres = require('./databases/postgres');
const mongodb = require('./databases/mongodb');

// runtimes
const runtimes = require('./runtimes/index');
const nodejs = require('./runtimes/nodejs');
const php = require('./runtimes/php');

// vcs
const vcs = require('./vcs/index');
const gitlab = require('./vcs/gitlab');
const svn = require('./vcs/svn');



module.exports = function (app) {

    // login
    app.use('/login', login);

    // dashboard
    app.use('/', dashboard);

    // help
    app.use('/help', help);

    // cronjobs
    app.use('/cronjobs', cronjobs);

    // databases
    app.use('/databases', databases);
    app.use('/databases/postgresql', postgres);
    app.use('/databases/mongodb', mongodb);

    // runtimes
    app.use('/runtimes', runtimes);
    app.use('/runtimes/nodejs', nodejs);
    app.use('/runtimes/php', php);

    // runtimes
    app.use('/vcs', vcs);
    app.use('/vcs/nodejs', gitlab);
    app.use('/vcs/php', svn);

};