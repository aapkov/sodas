const mongoose = require('mongoose');

// User schema
const UserSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    isDiscord:{
        type: Boolean,
        required: false
    },
    isTwitch:{
        type: Boolean,
        required: false
    },
    isAdmin: {
        type: Boolean,
        required: false
    }
})

const User = module.exports = mongoose.model('User', UserSchema);