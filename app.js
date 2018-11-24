const express = require('express') ;
const http = require('http') ;
const path = require('path') ;
const config = require('config') ;
const HttpError = require("error").HttpError;
const bodyParser  = require('body-parser');
const cookieParser  = require('cookie-parser');
const session = require('express-session');
const mongoose = require("libs/mongoose");
const logger = require('morgan');
const createError = require('http-errors');
const checkAuth = require('middleware/checkAuth');
const fs = require('fs');

const app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.set('port', config.get('port'));
let accessLogStream = fs.createWriteStream(__dirname + '/access.log',{flags: 'a'});
// app.use(logger('dev'));
app.use(logger('combined', {stream: accessLogStream}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

// var MongoStore = require('connect-mongo')(session);
const sessionStore = require('libs/sessionStorage');
app.use(session({
    secret: config.get("session:secret"),
    key: config.get("session:key"),
    cookie: config.get("session:cookie"),
    // store: new MongoStore({mongooseConnection: mongoose.connection})
    store: sessionStore
}));

app.use(require("middleware/sendHttpError"));
app.use(require("middleware/loadUser"));

const frontpageRouter = require('./routes/frontpage');
const loginRouter = require('./routes/login');
const chatRouter = require('./routes/chat');
const logoutRouter = require('./routes/logout');
const regRouter = require('./routes/registration');


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

const server = http.createServer(app);
server.listen(app.get('port'), () => console.log(`Example app listening on port ` + config.get('port')));

require('./socket')(server);