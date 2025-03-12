const mongoose = require('mongoose')
const imageSchema = new mongoose.Schema({
    path: { type: String, default: "" },
    filename: { type: String, default: "" },

})
module.exports = mongoose.model('image', imageSchema)

