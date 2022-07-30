const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({ ...req.body, password: hashPassword }).save();
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/getuserinfo", async (req, res) => {
  //console.log(req.body);
  try {
    const tokenContents = jwt.verify(
      req.body.token,
      `${process.env.JWTPRIVATEKEY}`
    );
    //console.log(tokenContents);

    const userInfo = await User.findOne({ _id: tokenContents._id });
    //console.log(userInfo);
    return res.send(userInfo);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
    console.log(error);
  }
});

module.exports = router;
