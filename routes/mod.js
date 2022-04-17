const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const helpers = require('../public/js/helpers.js');
const ObjectId = require('mongodb').ObjectId;
const config = require('../config/config');
const isModFormDisabled = config.isModFormDisabled;

var Recaptcha = require('express-recaptcha').RecaptchaV2;
var recaptcha = new Recaptcha(config.SITE_KEY, config.SECRET_KEY);

// bring in models
let ModApplication = require('../models/modApplication');

router.get('/apply', recaptcha.middleware.render, (req, res) => {
    if (isModFormDisabled) {res.render('/');}
    res.render('mod_apply', { captcha: res.recaptcha });
});

// mod applications default view
router.get('/view/:resolution', helpers.checkAuthentication, (req, res) => {
    ModApplication.find({resolution: req.params.resolution}, (err, modApplications) => {
        if(err) { console.log(err) }
        if (Object.keys(modApplications).length < 1) {
            return res.render('mod', {
                empty: true,
                resolution: req.params.resolution
            });
        }
        res.render('mod', {
            modApplications: modApplications,
            resolution: req.params.resolution
        });
    });
});

router.post('/apply',
    recaptcha.middleware.verify,
    body('discordTag', 'Discord tag is required').notEmpty().escape().isLength({min:2, max: 32}),
    body('textContent', 'Tell us why').notEmpty().escape(),
    body('howLong', 'Please specify how long have you been in the discord').notEmpty().escape(),
    body('experience', 'Fill in experience field').notEmpty().escape(),
    body('improvement', 'Tell us about improvements you can make').notEmpty().escape(),
    async (req, res) => {
        if (req.recaptcha.error) {
            req.flash('error', 'Captcha error');
            return res.redirect('/mod/apply');
        }
        if (isModFormDisabled) { return res.status(500).send(); }
        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.render('mod_apply', {
                errors: errors.errors
            });
        }
        let queryDb = await ModApplication.find({
            discordTag: req.body.discordTag
        });

        if (!Object.keys(queryDb).length <= 0) {
            req.flash('error', 'Request for that user already exists');
            res.redirect('/');
            return;
        }

        let modApplication = new ModApplication({
            discordTag: req.body.discordTag,
            textContent: req.body.textContent,
            howLong: req.body.howLong,
            experience: req.body.experience,
            improvement: req.body.improvement,
        });
        
        modApplication.save( (err) => {
        if (err) { return console.log(err); }
        req.flash('success', 'Mod application sent!');
        res.redirect('/'); 
        });      
    }
);

// update mod application
router.put('/update/:id',
    async (req, res) => {
        if (!req.user._id) {
            return res.status(500).send();
        }
        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            return res.redirect('mod/applicaion/:id', {
                errors: errors.errors
            });}
            ModApplication.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { "resolution" : req.body.resolution }},
                (err) => {
            if (err) {console.log(err)}
            res.status(200).send();
        })
    }   
);

// get single application
router.get(`/application/:id`, helpers.checkAuthentication, async (req, res) => {
    let modApplication = await ModApplication.findById(req.params.id).exec();
    if (Object.keys(modApplication).length > 0) {
       res.render('single_mod_application', {
            _id: req.params.id,
            discordTag: modApplication.discordTag,
            textContent: modApplication.textContent,
            howLong: modApplication.howLong,
            experience: modApplication.experience,
            improvement: modApplication.improvement,
            resolution: modApplication.resolution,
            isAccepted: modApplication.isAccepted
        }); 
    } else {
        console.log('application does not exist, id: ' + req.params.id);
        res.redirect('/');
    }  
})

module.exports = router;