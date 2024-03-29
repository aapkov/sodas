const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { limitUserAccess, checkAuthentication } = require('../public/js/helpers.js');

// Bring in discord bot
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(process.env.BOT_TOKEN);

// Bring in models
let Color = require('../models/color');
let User = require('../models/user');

// Post Routing
router.get(`/add`, checkAuthentication, (req, res) => {
    limitUserAccess(req, res, 'discord');
    res.render('add_color', {
        title: 'Add color'
    });
});

// add color
router.post('/add',
    body('name', 'Name is required').notEmpty(),
    body('name', 'Name can contain only 2 - 18 letters').isLength({min:2, max: 18}),
    body('hex', 'Hex is required').notEmpty(),
    body('hex', 'Must be a valid hex value').isHexColor().isAlphanumeric(),
    async (req, res) => {
    limitUserAccess(req, res, 'discord');
    let errors = validationResult(req);
    if (Object.keys(errors.errors).length > 0) {
        return res.render('add_color', {
            title: 'Add color',
            user: req.user,
            errors: errors.errors
        });
    }

    // integration with discord bot
    let channel = client.channels.cache.get(process.env.TEST_CHANNEL_ID);

    // create the role,. get id, and update color object with it
    if (await doesColorExist(req.body.name)) {
        return res.render('add_color', {
            title: 'Add color',
            errors: [{'msg': 'Role with that name already exists'}] });}
    let color = new Color();
    color.name = req.body.name;
    color.hex = req.body.hex;
    color.author = req.user._id;

    let colorID = await addColor(channel, color.name, color.hex);
    color.id = colorID;
    color.save( (err) => {
    if (err) { return console.log(err); }
    req.flash('success', 'Color added');
    res.redirect('/');
    });
});

// deleting colors
router.delete('/:id', async (req, res) => {
    limitUserAccess(req, res, 'discord');
    let channel = client.channels.cache.get(process.env.TEST_CHANNEL_ID);
    await deleteColor(channel, req.params.id);
    req.flash('success', 'Color Deleted');
    res.status(200).send();
});

// discord functions
async function doesColorExist(roleName) {
    let result = await Color.find({
        name: roleName
    });
    if (Object.keys(result).length > 0) { return true }
}

async function addColor(channel, colorName, colorHex) {
    try {
        let role = await channel.guild.roles.create({
            name:colorName,
            color:'#' + colorHex,
            position: 2,
    });
    return role.id;
    } catch (error) { console.log(error); } 
}

async function deleteColor(channel, color_id) {
    let color = await Color.findById(color_id);
    if (color) { 
        let query = { _id: color_id }
        await Color.findByIdAndRemove(query);
        // remove from discord
        channel.guild.roles.cache.find(r => r.id === color.id).delete();
        } else {
        console.log('Could not find color with id:' + color_id);
    }
}

module.exports = router;