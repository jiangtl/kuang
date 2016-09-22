var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var consolidate = require('consolidate');

var isDev = process.env.NODE_ENV !== 'production';
var app = express();
var port = 3000;
// view engine setup
app.engine('html', consolidate.ejs);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './server/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// local variables for all views
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;

// 开发模式
if(isDev) {
  // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
  var webpack = require('webpack'),
      webpackDevMiddleware = require('webpack-dev-middleware'),
      webpackHotMiddleware = require('webpack-hot-middleware'),
      webpackDevConfig = require('./webpack.config.js');
  // attach to the compiler & the server
  var compiler = webpack(webpackDevConfig);

  app.use(webpackDevMiddleware(compiler, {
    // public path should be the same with webpack config
    publicPath: webpackDevConfig.output.publicPath,
    noInfo: true,
    stats: {
      colors: true
    }
  }));
  app.use(webpackHotMiddleware(compiler));

  require('./server/routes')(app);

  // add "reload" to express, see: https://www.npmjs.com/package/reload
  var reload = require('reload');
  var http = require('http');

  var server = http.createServer(app);
  reload(server, app);

  server.listen(port, function(){
    console.log('App (dev) is now running on port ' + port + '!');
  });
} else {
  // static assets served by express.static() for production
  app.use(express.static(path.join(__dirname, 'public')));
  require('./server/routes')(app);
  app.listen(port, function () {
      console.log('App (production) is now running on port  ' + port + '!');
  });
}
