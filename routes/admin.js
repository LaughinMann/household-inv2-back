const express = require('express');
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const router = express.Router();
const passwordComplexity = require("joi-password-complexity");

router.post("/get-user", async (req, res) => {
	const user = User.findOne(
		{email: req.body.email},
		function(err, user) {
			if (err) {
				console.log(err)
			} else {
				console.log(user);
				return res.send(user);
			}
		})
});

router.post("/set-user-details", async (req, res) => {
	User.findOneAndUpdate(
		{email: req.body.old_email},
		{
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email
		},
		function(err, user) {
			if (err) {
				console.log(err)
			} else {
				console.log("Updated");
				res.status(500).send({ message: "User Successfully Updated", user});
			}
		})
});

router.post("/set-user-password", async (req, res) => {
	try {
		//SALT password for new passwords to compare
		const SALT = await bcrypt.genSalt(Number(process.env.SALT))

		//Hash new passwords
		const new_pass = await bcrypt.hash(req.body.new_password, SALT);
		const new_pass_confirm = await bcrypt.hash(req.body.new_password_confirm, SALT);

		if (new_pass === new_pass_confirm)
		{
			const {error} = validate(req.body);

			if (error)
				return res.status(500).send({message: error.details[0].message});

			User.findOneAndUpdate({email: req.body.email}, {
					password: new_pass
				},
				function(err, user) {
					if (err) {
						console.log(err)
					} else {
						res.status(500).send({ message: "User Password Successfully Updated" });
					}
				})
		}
		else
		{
			res.status(500).send({ message: "Passwords do not match or incorrect current password given." });
		}
	}
	catch (e) {
		return e;
	}
});

router.post("/add-authorized-user", async (req, res) => {
	if (req.body.user_email === req.body.email_to_add)
		return res.status(500).send({ message: "Emails are the same."});

	const authorized_user = await User.findOne({email: req.body.email_to_add});

	User.findOneAndUpdate(
		{email: req.body.user_email},
		{
			$addToSet: { users_authorized: authorized_user}
		},
		function(err, user) {
			if (err) {
				console.log(err)
			} else {
				res.status(500).send({ message: "User has been authorized or user is already authorized." });
				console.log("Authorized user added or already exists in authorized users.");
			}
		})
});

router.post("/remove-authorized-user", async (req, res) => {
	const authorized_user_to_remove = await User.findOne({email: req.body.email_to_remove});

	if (authorized_user_to_remove !== null) {
		User.findOneAndUpdate(
			{email: req.body.user_email},
			{
				$pull: {users_authorized: authorized_user_to_remove._id}
			},
			function (err, user) {
				if (err) {
					console.log(err)
				} else {
					res.status(500).send({message: "User has been removed as a authorized user."});
				}
			})
	} else {
		res.status(500).send({message: "Invalid email. Try again with a different email."});
	}
});

const validate = (data) => {
	const schema = Joi.object({
		new_password: passwordComplexity().required().label("New Password"),
	}).options({allowUnknown: true});
	return schema.validate(data);
};


module.exports = router;