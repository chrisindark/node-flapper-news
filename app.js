var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var passport = require('passport');
var mongoose = require('mongoose');

require('./models/users');
require('./models/posts');
require('./models/comments');
require('./config/passport-config');

var indexRoutes = require("./routes/index");
var partialsRoutes = require("./routes/partials");
var postsRoutes = require("./routes/posts");
var commentsRoutes = require("./routes/comments");
var authRoutes = require("./routes/auth");
var usersRoutes = require("./routes/users");

mongoose.connect('mongodb://localhost/news');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRoutes);
app.use("/", partialsRoutes);
app.use("/", postsRoutes);
app.use("/", commentsRoutes);
app.use("/", authRoutes);
app.use("/", usersRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
