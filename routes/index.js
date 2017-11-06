
// dashboard
var dashboard = require('./dashboard');

// help
var help = require('./help/index');

// cronjobs
var cronjobs = require('./cronjobs/index');

// databases
var databases = require('./databases/index');
var postgres = require('./databases/postgres');
var mongodb = require('./databases/mongodb');

// runtimes
var runtimes = require('./runtimes/index');
var nodejs = require('./runtimes/nodejs');
var php = require('./runtimes/php');

// vcs
var vcs = require('./vcs/index');
var gitlab = require('./vcs/gitlab');
var svn = require('./vcs/svn');



module.exports = function (app) {

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