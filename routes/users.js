const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require ('passport');
const helpers = require('../public/js/helpers.js');
const config = require('../config/config');

var Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(config.SITE_KEY, config.SECRET_KEY);

// bring in user model
let User = require('../models/user');

// register
router.get('/register', helpers.checkAuthentication, (req, res) => {
    res.render('register');
});

router.post('/register',
    body('username', 'Username is required, only letters allowed, 3 - 18 characters').notEmpty().isAlpha().isLength({min:3, max: 18}),
    body('email', 'Email is required').notEmpty(),
    body('email', 'Email is not valid').isEmail(),
    body('password', 'Password is required, 5 - 18 characters').notEmpty().isLength({min:5, max: 18}),
    (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.render('register', {
                errors:errors.errors,
                user: req.user
            });
        }
        let newUser = new User ({
            username: username,
            email: email,
            password: password
        });
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(newUser.password, salt, (error, hash) =>{
                if(error) { return console.log(error) }
                newUser.password = hash;
                newUser.save((error) => {
                    if(error) { return console.log(error); }
                    req.flash('success', 'Registered');
                    res.redirect('/');
                })
            });
        })      
});

// login form
router.get('/login', recaptcha.middleware.render, (req, res) => {
    res.render('login', { captcha: res.recaptcha });
});

router.post('/login', recaptcha.middleware.verify, (req, res, next) => {
    if (req.recaptcha.error) {
        req.flash('error', 'Captcha error');
        return res.redirect('/users/login');
    }
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged out');
    res.redirect('/users/login');
})

module.exports = router;