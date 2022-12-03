const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const tmi = require('tmi.js');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const { body, validationResult } = require('express-validator');
const { limitUserAccess, checkAuthentication } = require('../public/js/helpers.js');


// Bring in discord bot
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const streamAnnouncementCooldown = 300000;
var lastStreamDate = 0;
client.login(process.env.BOT_TOKEN);

//Connect to mongoDB
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Bring in models
let Announcer = require('../models/announcer');

// TWITCH ANNOUNCER START
const eventTypes =
    [
        "stream.online"
    ];
let access_token = ''; // needs to be generated every time

function clearSubscriptions () {
    axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
        headers: {
            'Client-Id': process.env.TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + access_token
        }
    }).then(response => {
        if (response.status === 200) {
            const subscribedEvents = response.data;
            for (let i = 0; i < subscribedEvents.data.length; i++) {
                axios.delete("https://api.twitch.tv/helix/eventsub/subscriptions?id=" + subscribedEvents.data[i].id,
                {
                    headers: {
                        'Client-Id': process.env.TWITCH_CLIENT_ID,
                        'Authorization': 'Bearer ' + access_token
                    }
                })
                .then(() => {
                    console.log('unsubscribed from an event ' + subscribedEvents.data[i].type);
                })
                .catch(webhokError => {
                    console.log(webhokError);
                });
            }
        } else {
            console.log(response.status, response.data);
        }
    })
    .catch(err => {
        console.log(err);
    });
}

axios.post("https://id.twitch.tv/oauth2/token" +
    "?client_id=" + process.env.TWITCH_CLIENT_ID +
    "&client_secret=" + process.env.TWITCH_CLIENT_SECRET +
    "&grant_type=client_credentials" +
    "&scope=analytics:read:extensions analytics:read:games bits:read channel:edit:commercial " +
    "channel:manage:broadcast channel:manage:extensions channel:manage:polls channel:manage:predictions " +
    "channel:manage:redemptions channel:manage:schedule channel:manage:videos channel:read:editors " +
    "channel:read:goals channel:read:hype_train channel:read:polls channel:read:predictions " +
    "channel:read:redemptions channel:read:stream_key channel:read:subscriptions clips:edit moderation:read " +
    "moderator:manage:banned_users moderator:read:blocked_terms moderator:manage:blocked_terms " +
    "moderator:manage:automod moderator:read:automod_settings moderator:manage:automod_settings " +
    "moderator:read:chat_settings moderator:manage:chat_settings user:edit user:edit:follows " +
    "user:manage:blocked_users user:read:blocked_users user:read:broadcast user:read:email user:read:follows " +
    "user:read:subscriptions channel:moderate chat:edit chat:read whispers:read whispers:edit")
    .then(response => {
        const responseData = response.data;
        access_token = responseData.access_token;
        
        axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
        headers: {
            'Client-Id': process.env.TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + access_token
        }
        }).then(response => {
        if (response.status === 200) {
            const subscribedEvents = response.data;

            if (subscribedEvents.data.length == 0) {
                for (let i = 0; i < eventTypes.length; i++) {
                    axios.post("https://skippybot.me/announcer/createWebhook?eventType=" + eventTypes[i])
                        .then(() => {
                            console.log("Webhook successfully established");
                        })
                        .catch(webhookError => {
                            console.log("Webhook creation error: " + webhookError);
                        });
                }
            }
        } else {
            console.log(response.status, response.data);
        }
    })
    .catch(err => {
        console.log(err);
    });
    })
    .catch(error => {
        console.log(error);
});

const verifyTwitchWebhookSignature = (request, response, buffer, encoding) => {
    const twitchMessageID = request.header("Twitch-Eventsub-Message-Id");
    const twitchTimeStamp = request.header("Twitch-Eventsub-Message-Timestamp");
    const twitchMessageSignature = request.header("Twitch-Eventsub-Message-Signature");
    const currentTimeStamp = Math.floor(new Date().getTime() / 1000);

    if (Math.abs(currentTimeStamp - twitchTimeStamp) > 600) {
        throw new Error("old signature");
    }
    if (!process.env.TWITCH_SIGNING_SECRET) {
        throw new Error("The Twitch signing secret is missing.");
    }

    const myMessageSignature = "sha256=" + crypto.createHmac('sha256', process.env.TWITCH_SIGNING_SECRET)
    .update(twitchMessageID + twitchTimeStamp + buffer).digest('hex');

    if (twitchMessageSignature !== myMessageSignature) {
        throw new Error("Invalid signature");
    } else {
        console.log("signature verified");
    }
}

router.use(express.json({ verify: verifyTwitchWebhookSignature }));

// axios.get('"https://api.twitch.tv/helix/eventsub/subscriptions', {
//                         headers: {
//                         'Client-Id': process.env.TWITCH_CLIENT_ID,
//                         'Authorization': 'Bearer ' + access_token
//                         }
//                         }).then((res) => {console.log(JSON.parse(res))})

//handle verified the events
async function twitchWebhookEventHandler(webhookEvent)  {
    console.log("im in twitcheventhandler");
    sendAnnouncementMessage(webhookEvent);
    // console.log(webhookEvent);
}

router.get('/redirect', (req, res) => {
    res.render('verify_redirect');
})

router.post('/webhooks/callback', async (request, response) => {
    if (request.header("Twitch-EventSub-Message-Type") === "webhook_callback_verification") {
        console.log("Verifying the Webhook is from Twitch");
        response.writeHeader(200, {"Content-Type": "text/plain"});
        response.write(request.body.challenge);

        return response.end();
    }

    // Handle the Twitch event
    const eventBody = request.body;
    console.log("Recieving " +
        eventBody.subscription.type + " request for " +
        eventBody.event.broadcaster_user_name, eventBody);
    twitchWebhookEventHandler(eventBody);
    response.status(200).end();
})

router.post('/createWebhook', (request, response) => {
    let createWebhookParameters = {
        host: "api.twitch.tv",
        path: "helix/eventsub/subscriptions",
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Authorization": "Bearer " + access_token
        }
    };

    let createWebhookBody = {
        "type": request.query.eventType,
        "version": "1",
        "condition": {
            "broadcaster_user_id": process.env.BROADCASTER_ID,
        },
        "transport": {
            "method": "webhook",
            "callback": "https://skippybot.me/announcer/webhooks/callback",
            "secret": process.env.TWITCH_SIGNIN_SECRET
        }
    };

    let responseData = "";
    let webhookRequest = https.request(createWebhookParameters, (result) => {
        console.log('statusCode:', result.statusCode);
        console.log('headers:', result.headers);
        result.setEncoding('utf8');
        result.on('data', function (data) {
            responseData = responseData + data;
        }).on('end', function (result) {
            let responseBody = JSON.parse(responseData);
            response.send(responseBody);
        })
    });

    webhookRequest.on('error', (error) => {
        console.log(error);
    });
    webhookRequest.write(JSON.stringify(createWebhookBody));
    webhookRequest.end();
});

// DISCORD MESSAGE
async function sendAnnouncementMessage(event) {
	let announcer = await Announcer.find({}, async (err) => {
        if(err) { console.log(err) }
    });
    console.log("announcer " + announcer);
	if (Object.keys(announcer).length > 0) {
        if (announcer.isEnabled == 'true') {
            let channel = client.channels.cache.get(process.env.CHANNEL_ANNOUNCEMENTS_ID);
		let stream = await twitch.helix.streams.getStreamByUserId(event.broadcaster_user_id);
		let startDate = stream.startDate;
		let startDateParsed = Date.parse(startDate);
		if (lastStreamDate == 0 || (startDateParsed - lastStreamDate) > streamAnnouncementCooldown ) {
			lastStreamDate = startDateParsed;

			channel.send(announcer.content);
		} else { 
			lastStreamDate = startDateParsed;
			console.log("did not log another stream start because of cooldown") 
		    }
        }	
	} else {
		console.log("did not announce cause announcements are off");
	}
}

router.get(`/`,
body('content', 'Content is required!').notEmpty(),
checkAuthentication,
async (req, res) => {
    Announcer.find({}, async (err, announcementCheck) => {
        if(err) {
            console.log(err)
        } else {
            if (Object.keys(announcementCheck).length <= 0) {
                let announcement = new Announcer();
                announcement.id = "1";
                announcement.isEnabled = false;
                announcement.content = 
                "Input the message content here\nDont forget enters (newlines), and the stream link!"
                announcement.save( (err) => {
                    if (err) { return console.log(err); }
                    });
                }
            let updatedAnnouncement = await Announcer.find({ id: "1" });
            res.render('announcer', {
            isEnabled: updatedAnnouncement[0].isEnabled,
            content: updatedAnnouncement[0].content
        });  
        }
    });
})

router.post(`/update`,
checkAuthentication,
async (req, res) => {
    let announcement = new Announcer();
    announcement.id = '1';
    announcement.isEnabled = req.body.isEnabled;
    announcement.content = req.body.content;

    Announcer.findOneAndDelete({id: '1'}, function (err) {
        if (err) { console.log(err) }
    });

    announcement.save( (err) => {
        if (err) { return console.log(err); }
            req.flash('success', 'Announcer updated!');
            res.redirect('/');
    });
});

module.exports = router;