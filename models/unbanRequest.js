let mongoose = require('mongoose');

// Schema
let unbanRequestSchema = mongoose.Schema({
    isDiscord: {
        type: Boolean,
        required: true
    },
    isJustified: {
        type: Boolean,
        required: true
    },
    textContent:{
        type: String,
        required: true
    },
    howLongAgo:{
        type: String,
        required: true
    }
})

let UnbanRequest = module.exports = mongoose.model('UnbanRequest', unbanRequestSchema);