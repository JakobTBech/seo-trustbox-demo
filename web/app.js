var express = require('express');
var expressHandlebars = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// If we're not operating in NITROUS-world then we'll read a local config.json file
if (!process.env['NITROUS_USERNAME']) {
  var localConfig = require('./config.json');
  for (var key in localConfig) {
    process.env[key] = localConfig[key];
  }
}

// Start the web application
var app = express();

// Configure the view engine (handlebars)
var exphbs = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname,'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
});
app.engine('handlebars', exphbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Configure misc settings for the web application
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Get the Routes code
var routes = require('./routes/index');
var auth = require('./routes/auth');
var products = require('./routes/products');
// var seo = require('./routes/seo');

// Set the Routes to use
app.use('/', routes);
app.use('/auth', auth);
app.use('/products', products);
//app.use('/seo', seo);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

module.exports = app;