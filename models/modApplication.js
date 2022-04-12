let mongoose = require('mongoose');

// Schema
let modApplicationSchema = mongoose.Schema({
    discordTag: {
        type: String,
        required: true
    },
    textContent:{
        type: String,
        required: true
    },
    howLong:{
        type: String,
        required: true
    },
    experience:{
        type: String,
        required: true
    },
    improvement:{
        type: String,
        required: true
    },
    resolution:{
        type: String,
        required: true,
        default: 'u'
    }
})

let ModApplication = module.exports = mongoose.model('ModApplication', modApplicationSchema);