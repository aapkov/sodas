let mongoose = require('mongoose');

// Schema
let colorSchema = mongoose.Schema({
    id: {
        type: String,
        required: false
    },
    name:{
        type: String,
        required: true
    },
    hex:{
        type: String,
        required: true
    },
    author: {
        type: String,
        required: false
    }
})

let Color = module.exports = mongoose.model('Color', colorSchema);