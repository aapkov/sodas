let mongoose = require('mongoose');

// Schema
let unbanRequestSchema = mongoose.Schema({
    isDiscord: {
        type: Boolean,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    isJustified: {
        type: Number,
        required: true
    },
    banReason:{
        type: String,
        required: true
    },
    unbanReason:{
        type: String,
        required: true
    },
    howLongAgo:{
        type: Number,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    resolution:{
        type: String,
        required: true,
        default: 'u'
    }
})

let UnbanRequest = module.exports = mongoose.model('UnbanRequest', unbanRequestSchema);