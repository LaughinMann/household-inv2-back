const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	properties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
	users_authorized: [{ type: Schema.Types.ObjectId, ref: 'AuthUsers' }], //Users that are authorized IDs
	isAdmin: { type: Boolean, required: false, default: false} //Boolean for if a user is an Admin, Default: false
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, `${process.env.JWTPRIVATEKEY}`, {
		expiresIn: "7d",
	});
	return token;
};

const User = mongoose.model("user", userSchema);

const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = { User, validate };
