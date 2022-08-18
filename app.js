require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const config = require('./config/config');
const passport = require('passport');
const cron = require('node-cron');
const port = process.env.PORT;

// Bring in discord bot
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(process.env.BOT_TOKEN);

// bring in models
let UnbanRequest = require('./models/unbanRequest');

// Set Public Folder
app.use(express.static(path.join(__dirname, '/public')));

// Task scheduler
cron.schedule('0 */12 * * *', () => {
    let channel = client.channels.cache.get(process.env.REMINDERS_CHANNEL_ID);
    UnbanRequest.find({
        resolution: "u"
    }).then((result) => {
        if (!result.length <= 0) {
            channel.send(`Pending unban request/s awaiting approval: ${result.length}\n https://skippybot.me/unban/view/u/1`) }
    });
});

// Express session
app.use(session({
    secret: config.SECRET,
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
let unbanRoutes = require('./routes/unban');
app.use('/unban', unbanRoutes);
app.use('/users', userRoutes);
app.use('/colors', colorRoutes);
app.use('/mod', modRoutes);

// Server Start
app.listen(port, () =>{
    console.log('Server up on port: ' + port);
})