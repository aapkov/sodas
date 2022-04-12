const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const helpers = require('../public/js/helpers.js');
const ObjectId = require('mongodb').ObjectId;

// bring in models
let ModApplication = require('../models/modApplication');

router.get('/apply', (req, res) => {
    res.render('mod_apply');
});

// mod applications default view
router.get('/view/:resolution', helpers.checkAuthentication, (req, res) => {
    ModApplication.find({resolution: req.params.resolution}, (err, modApplications) => {
        if(err) { console.log(err) }
        if (Object.keys(modApplications).length < 1) {
            res.render('mod', {
                empty: true
            })
        }
        else {
            res.render('mod', {
                modApplications: modApplications
            });  
        }
    });
});

router.post('/apply',
    body('discordTag', 'Discord tag is required').notEmpty().escape(),
    body('textContent', 'Tell us why').notEmpty().escape(),
    body('howLong', 'Please specify how long have you been in the discord').notEmpty().escape(),
    body('experience', 'Fill in experience field').notEmpty().escape(),
    body('improvement', 'Tell us about improvements you can make').notEmpty().escape(),
    async (req, res) => {
        let errors = validationResult(req);
        if (Object.keys(errors.errors).length > 0) {
            res.render('mod_apply', {
                errors: errors.errors
            });} 
            else { 
                let modApplication = new ModApplication();
                modApplication.discordTag = req.body.discordTag;
                modApplication.textContent = req.body.textContent;
                modApplication.howLong = req.body.howLong;
                modApplication.experience = req.body.experience;
                modApplication.improvement = req.body.improvement;
                modApplication.save( (err) => {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    req.flash('success', 'Mod application sent!')
                    res.redirect('/');
                    }
                });   
        }  
    }
);

// update mod application
router.put('/update/:id',
    async (req, res) => {
        if (!req.user._id) {
            res.status(500).send();
        } else {
            let errors = validationResult(req);
            if (Object.keys(errors.errors).length > 0) {
                res.render('mod/applicaion/:id', {
                    errors: errors.errors
                });}
                else {
                    ModApplication.findOneAndUpdate(
                        { _id: req.params.id },
                        { $set: { "resolution" : req.body.resolution }},
                        (err) => {
                    if (err) {console.log(err)}
                })
            }
        }
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