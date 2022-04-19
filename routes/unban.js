const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const helpers = require('../public/js/helpers.js');
const config = require('../config/config');
const { checkAuthentication } = require('../public/js/helpers.js');

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

router.get('/view/:resolution', checkAuthentication, (req, res) => {
    let query = {};
    if (req.user.isAdmin || (req.user.isDiscord && req.user.isTwitch)) {
        query = { resolution: req.params.resolution }} 
    else {
        query = { resolution: req.params.resolution, isDiscord: req.user.isDiscord }}

    UnbanRequest.find(query, (err, unbanApplications) => {
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
    body('userName', 'Username is required').notEmpty().isLength({min:2, max: 32}),
    body('isJustified', 'Fill all the fields').notEmpty(),
    body('howLongAgo', 'Fill all the fields').notEmpty(),
    body('banReason', 'Fill all the fields').notEmpty().isLength({min:1, max: 1000}),
    body('unbanReason', 'Fill all the fields').notEmpty().isLength({min:1, max: 1000}),
    async (req, res) => {
        if (req.recaptcha.error) {
            req.flash('error', 'Captcha error');
            return res.redirect('/form');
        }

        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.render('unban_request', {
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
            upvotes: [],
            downvotes: [],
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

        let unbanRequest = await UnbanRequest.findOne({ _id: req.params.id}).exec();
        let unbanRequestUpvotes = JSON.stringify(unbanRequest.upvotes);
        let unbanRequestDownvotes = JSON.stringify(unbanRequest.downvotes);

        let query = {};
        if (req.body.resolution) {
            query = { $set: { "resolution" : req.body.resolution }};
        } else if (req.body.value === 'upvotes') {
            if (unbanRequestUpvotes.indexOf(req.user._id) > -1) {
                return res.status(409).send();
            } else { query = { $push: { "upvotes" : req.user._id }}; }
        } else if (req.body.value === 'downvotes') {
            if (unbanRequestDownvotes.indexOf(req.user._id) > -1) {
                return res.status(409).send();
            } else { query = { $push: { "downvotes" : req.user._id }};}
        } else {
            console.log('else sssdggsd')
            return res.status(500).send();
        }

        UnbanRequest.findOneAndUpdate(
            { _id: req.params.id },
            query,
            (err) => {
        if (err) {console.log(err)}
        res.status(200).send();
        });
    }   
);

router.get(`/application/:id`, checkAuthentication, async (req, res) => {
    if (!req.user._id) { return res.status(500).send(); }
    let unbanRequest = await UnbanRequest.findById(req.params.id).exec();
    if (Object.keys(unbanRequest).length > 0) {
       res.render('single_unban_request', {
            _id: req.params.id,
            unbanRequest: unbanRequest
        }); 
    } else {
        console.log('Application does not exist, id: ' + req.params.id);
        res.redirect('/');
    }  
})

module.exports = router;