let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let mongoose = require('mongoose');
let passport = require('passport');
let session = require('express-session');
let cors = require('cors')

// Routes
let userRouter = require("./routes/user.js");
let produtorRouter = require("./routes/produtor.js");
let postsRouter = require("./routes/posts.js");
let noticiaRouter = require("./routes/noticia.js");

let app = express();

const { SECRET } = require('../config.js');

app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}));

//TODO: Still not sure if this is necessary, need to try
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// mongo setup
const mongoDB = "mongodb://localhost:27017/diario";
mongoose.connect(mongoDB);

const connection = mongoose.connection;

connection.on("error", console.error.bind(console, `[ERRO] - Erro ao estabelecer conexão com o endereço: ${mongoDB}`));
connection.once("open", () => { console.log(`[SETUP] - Conexão com o endereço '${mongoDB}' estabelecida com sucesso.`); });

// passport setup
const User = require("./models/user.js");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use("/produtor", produtorRouter);
app.use("/posts", postsRouter);
app.use("/noticia", noticiaRouter);

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

module.exports = app;
