const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const debug = require('debug')('hostlab:app');
const mongoConnection = require('./common/connections').mongo;
const initPassport = require('./common/passport');
const mountRoutes = require('./routes');
const methodOverride = require('method-override');

const app = express();

mongoose.connect(mongoConnection.url, {
  useMongoClient: true,
}).then(
    require('./modules/autostartusercontainer')(app),
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// add some useful locals
app.use((req, res, next) => {
  res.locals.moment = require('moment');
  res.locals.slugify = require('slugify');
  res.locals.hostlabUrl = app.get('host');
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
      secret: 'keyboard cat',
      store: new MongoStore({
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

app.use(flash());

// Initialize und configure Passport
initPassport(app);

// Override the original HTTP method with the method in `req.body._method`
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    const {_method} = req.body;
    delete req.body._method;
    return _method;
  }
}));

// Mount routes
mountRoutes(app);

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

  if (req.xhr) {
    res.json({error: err.message});
  } else {
    res.render('error');
  }
});

process.on('unhandledRejection', err => {
  debug(`
Unhandled Promise rejection
Stack: ${err.stack}`);
});

module.exports = app;
