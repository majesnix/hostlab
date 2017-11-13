// login
const login = require('./login');
const logout = require('./logout');


// dashboard
const dashboard = require('./dashboard');

// help
const help = require('./help/index');

// filemanager
var filemanager = require('./filemanager/index');

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



module.exports = (app) => {

    // login
    app.use('/login', login);

    // logout
    app.use('/logout', logout);

    // dashboard
    app.use('/', dashboard);

    // help
    app.use('/help', help);

    // filemanager
    app.use('/filemanager', filemanager);

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