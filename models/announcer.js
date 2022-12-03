let mongoose = require('mongoose');

// Schema
let announcerSchema = mongoose.Schema({
    id:{
        type: String,
        required: true
    },
    isEnabled: {
        type: String,
        required: true,
        default: "false"
    },
    content:{
        type: String,
        required: true
    }
})

let Announcer = module.exports = mongoose.model('Announcer', announcerSchema);