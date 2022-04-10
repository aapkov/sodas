const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require ('passport');

// bring in user model
let User = require('../models/user');

// register
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register',
    body('username', 'Username is required, only letters allowed, 3 - 18 characters').notEmpty().isAlpha().isLength({min:3, max: 18}),
    body('email', 'Email is required').notEmpty(),
    body('email', 'Email is not valid').isEmail(),
    body('password', 'Password is required, 5 - 18 characters').notEmpty().isLength({min:5, max: 18}),
    // body('confirmpassword', 'Passwords do not match').equals(body.password),

    (req, res) => {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            console.log('errors, im here');
            res.render('register', {
                errors:errors.errors
            });
        } else {
            let newUser = new User ({
                username: username,
                email: email,
                password: password
            });
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(newUser.password, salt, (error, hash) =>{
                    if(error) {
                        console.log(error)
                    }
                    newUser.password = hash;
                    newUser.save((error) => {
                        if(error) {
                            console.log(error);
                            return;
                        } else {
                            req.flash('success', 'Registered');
                            res.redirect('/users/login');
                        }
                    })
                });
            })

        }
});

// login form
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Youa re logged out');
    res.redirect('/users/login');
})

module.exports = router;