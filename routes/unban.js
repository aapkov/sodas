const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const helpers = require('../public/js/helpers.js');
const config = require('../config/config');

var Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(config.SITE_KEY, config.SECRET_KEY);

// bring in user model
let UnbanRequest = require('../models/unbanRequest');

// main page
router.get('/', (req, res) => {
    res.render('unban_request');
});

router.get('/form', recaptcha.middleware.render, (req, res) => {
    res.render('unban_request_form', { isDiscord: req.query.isDiscord, captcha: res.recaptcha });
});

router.get('/view/:resolution', helpers.checkAuthentication, (req, res) => {
    UnbanRequest.find({resolution: req.params.resolution}, (err, unbanApplications) => {
        if(err) { console.log(err) }
        if (Object.keys(unbanApplications).length < 1) {
            return res.render('unban', {
                empty: true,
                resolution: req.params.resolution
            });
        }
        res.render('unban', {
            unbanApplications: unbanApplications,
            resolution: req.params.resolution
        });
    });
});

router.post('/form',
    recaptcha.middleware.verify,
    body('userName', 'Username is required').notEmpty().isLength({min:2, max: 25}),
    body('isJustified', 'Fill all the fields').notEmpty(),
    body('howLongAgo', 'Fill all the fields').notEmpty(),
    body('banReason', 'Fill all the fields').notEmpty().isLength({min:5, max: 1000}),
    body('unbanReason', 'Fill all the fields').notEmpty().isLength({min:5, max: 1000}),
    async (req, res) => {
        if (!req.user._id) { return res.status(500).send(); }
        if (req.recaptcha.error) {
            req.flash('error', 'Captcha error');
            return res.redirect('/form');
        }

        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.redirect('/form', {
                errors:errors.errors,
            });
        }

        let queryDb = await UnbanRequest.find({
            userName: req.body.userName
        });

        if (!Object.keys(queryDb).length <= 0) {
            req.flash('error', 'Request for that user already exists');
            res.redirect('/');
            return;
        }

        let unbanRequest = new UnbanRequest ({
            userName: req.body.userName,
            isDiscord: req.body.isDiscord,
            isJustified: req.body.isJustified,
            howLongAgo: req.body.howLongAgo,
            banReason: req.body.banReason,
            unbanReason: req.body.unbanReason,
            notes: req.body.notes,
            resolution: 'u'
        });

        unbanRequest.save((err) => {
            if (err) { return console.log(err); }
            req.flash('success', 'Unban request sent!');
            res.redirect('/'); 
        });
});

router.put('/update/:id',
    async (req, res) => {
        if (!req.user._id) { return res.status(500).send(); }
        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.render('unban/applicaion/:id', {
                errors: errors.errors
            });}
            UnbanRequest.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { "resolution" : req.body.resolution }},
                (err) => {
            if (err) {console.log(err)}
            res.status(200).send();
        })
    }   
);

router.get(`/application/:id`, helpers.checkAuthentication, async (req, res) => {
    if (!req.user._id) { return res.status(500).send(); }
    let unbanRequest = await UnbanRequest.findById(req.params.id).exec();
    if (Object.keys(unbanRequest).length > 0) {
       res.render('single_unban_request', {
            _id: req.params.id,
            userName: unbanRequest.userName,
            isDiscord: unbanRequest.isDiscord,
            isJustified: unbanRequest.isJustified,
            howLongAgo: unbanRequest.howLongAgo,
            banReason: unbanRequest.banReason,
            unbanReason: unbanRequest.unbanReason,
            resolution: unbanRequest.resolution,
            notes: unbanRequest.notes
        }); 
    } else {
        console.log('Application does not exist, id: ' + req.params.id);
        res.redirect('/');
    }  
})

module.exports = router;