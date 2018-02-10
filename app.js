/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        // After 24 Hours the Session will be updated, even if it has not be modified and resave is set to false
        touchAfter: 5 // time period in seconds
      }),
      /**
       * Cookies will be deleted if they pass the maxAge duration, even if the User interacts with the service
       * rolling: true updates the maxAge entry for every Request
       */
      rolling: true,
      // if the session was not modified the session will not be resaved (for every request) to the SessionDB
      resave: false,
      /** 
       * Every request creates a cookie, even if the user doesnt log in
       * saveUninitialized: false does prevent the SessionDB to be polluted by these cookies
       */
      saveUninitialized: false,
      // Set the duration a cookie is saved
      cookie: {maxAge: 24 * 60 * 60 * 1000} // 24 hours
    },
));

app.use(flash());

// Initialize and configure Passport
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
