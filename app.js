require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');
const app = express();
const passport = require('passport');
const port = process.env.PORT;

// Set Public Folder
app.use(express.static(path.join(__dirname, '/public')));

// Express session
app.use(session({
    secret: 'rigs gay',
    resave: true,
    saveUninitialized: true
  }));

// Express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Bring in models
let Color = require('./models/color');

//Parse app/json
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//Connect to mongoDB
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = mongoose.connection;
db.once('open', () => {
    console.log('connected to mongoDB');
});

// DB Error logger
db.on('error', (e) => {
    console.log(e);
})

// View Engine - using pug
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Passport
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// Home Routing
app.get(`/`, (req, res) => {
    Color.find({}, (err, colors) => {
        if(err) {
            console.log(err)
        } else {
            res.render('index', {
            title: 'Colors',
            colors: colors
            });  
        }
    });
})

app.get('/icon', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/resources/icon.png'));
});

// Bring in routes
let colorRoutes = require('./routes/colors');
let userRoutes = require('./routes/users');
let modRoutes = require('./routes/mod');
app.use('/users', userRoutes);
app.use('/colors', colorRoutes);
app.use('/mod', modRoutes);

// Server Start
app.listen(port, () =>{
    console.log('Server up on port: ' + port);
})