var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var books = require('./routes/books');
var members = require('./routes/members');
var issues = require('./routes/issues');
var returns = require('./routes/returns');

var app = express();

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/library';

module.exports.db = null

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db.collection('books').ensureIndex("name", () => console.log("Books are indexed on name"))
  db.collection('members').ensureIndex("name", () => console.log("Members are indexed on name"))
  db.collection('issues').ensureIndex('issueDate', () => console.log("Issues are indexed on issueDate"))
  db.collection('issues').ensureIndex('returnDate', () => console.log("Issues are indexed on returnDate"))
  db.collection('issues').ensureIndex({ bookId: 1, status: 1 }, () => console.log("Issues are indexed on bookId and status"))
  db.collection('issues').ensureIndex({ memberId: 1, status: 1 }, () => console.log("Issues are indexed on memberId and status"))
  module.exports.db = db
  // db.close();
});

// app.use(function (req, res, next) {
//   console.log("args", arguments.length)
//   req.db = db1
//   next()
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})


app.use('/', index);
app.use('/users', users);
app.use('/books', books)
app.use('/members', members)
app.use('/issues', issues)
app.use('/returns', returns)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
