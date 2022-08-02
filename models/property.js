const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    property_description: {
        type: String,
        required: true
    },
    property_cost: {
        type: Number,
        required: true
    },
    property_quantity: {
        type: Number,
        required: true
    },
    images: [{
        type: String,
        required: false,
        ref: 'PropertyImages' }],
});

module.exports = mongoose.model('Property', propertySchema);