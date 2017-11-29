const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const debug = require('debug')('hostlab:app');

const configDB = require('./config/mongoDB.js');
mongoose.connect(configDB.url, {
  useMongoClient: true,
});

const app = express();

/**
 * Handlebars Konfiguration
 */
app.engine('hbs', handlebars({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: 'views/layouts/',
  partialsDir: 'views/partials/',
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(
    {
      secret: 'lol',
      store: new MongoStore(
          {
            mongooseConnection: mongoose.connection,

            // Nach 24 Stunden wird die Session in der DB geupdated, auch wenn sie nicht modifiziert wurde und resave auf false gesetzt ist
            touchAfter: 5 // time period in seconds
          }),

      // Cookies werden nach der maxAge Zeit gelöscht, auch bei Nutzerinteraktion
      // Durch rolling: true wird bei jedem Request das maxAge neu gesetzt
      rolling: true,

      // Wenn die Session nicht modifiziert wurde wird sie nicht bei jedem Request neu gespeichert
      resave: false,

      // Bei jedem Request werden Cookies erzeugt, auch wenn nicht eingeloggt wird.
      // Durch saveUninitialized: false werden diese Cookies nicht gespeichert und die SessionDB wird nicht vollgemüllt
      saveUninitialized: false,

      // Setzt die CookiespeicherDAUER auf eine festgelegte Zeit
      cookie: {maxAge: 24 * 60 * 60 * 1000} // 24 Stunden

    },
));

app.use(passport.initialize());
/**
 * Passport modifiziert nachdem Express die Session geladen hat diverse Parameter,
 * wie z.B req.user
 */
app.use(passport.session());

app.use(flash());

// configure passport
require('./config/passport')(passport);

// mount routes
require('./routes')(app);

/**
 * Erstelle initialen Administrator falls noch keine Nutzer vorhanden
 */
require('./databases/mongodb/models/user').count(function(err, userCount) {
  if (err) {
    return console.error(err);
  }
  debug('Got %d user(s) on start', userCount);
  if (userCount === 0) {
    debug('Creating initial user...');
    const initUser = {
      email: 'admin@hostlab.hsrw.eu',
      username: 'hsrwadmin',
      password: '12345678',
      isAdmin: true,
      isLdapUser: false,
    };
    require('./tasks/createUser')(initUser, function(err, user) {
      if (err) {
        console.error('Error while creating initial user:',
            err.message);
        process.exit(err.code);
      }
      debug('Created initial user: %o', initUser);
    });
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
