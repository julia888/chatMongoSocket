var express = require('express') ;
// const errorHandler  = require('express-error-handler') ;
const http = require('http') ;
const path = require('path') ;
const config = require('config') ;
const HttpError = require("error").HttpError;
var bodyParser  = require('body-parser');
var cookieParser  = require('cookie-parser');
var session = require('express-session');
var mongoose = require("libs/mongoose");
var logger = require('morgan');
var createError = require('http-errors');
var checkAuth = require('middleware/checkAuth');

const app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.set('port', config.get('port'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// var MongoStore = require('connect-mongo')(session);
var sessionStore = require('libs/sessionStorage');
app.use(session({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    // store: new MongoStore({mongooseConnection: mongoose.connection})
    store: sessionStore
}));

app.use(require("middleware/sendHttpError"));
app.use(require("middleware/loadUser"));

var frontpageRouter = require('./routes/frontpage');
var loginRouter = require('./routes/login');
var chatRouter = require('./routes/chat');
var logoutRouter = require('./routes/logout');
var regRouter = require('./routes/registration');


app.get('/', frontpageRouter.get);
app.get('/login', loginRouter.get);
app.post('/login', loginRouter.post);
app.get('/chat', checkAuth, chatRouter.get);
app.post('/logout', logoutRouter.post);
app.get('/registration', regRouter.get);
app.post('/registration', regRouter.post);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
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

app.use(function(req, res, next) {
    next(createError(404));
});

var server = http.createServer(app);
server.listen(app.get('port'), () => console.log(`Example app listening on port ` + config.get('port')));

require('./socket')(server);