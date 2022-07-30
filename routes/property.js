const express = require("express");
const router = express.Router();
//const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

// Load Property model
const Property = require("../models/property");

// @route GET api/properties/test
// @description tests properties route
// @access Public
router.get("/test", (req, res) => res.send("property route testing!"));

// @route GET api/properties
// @description Get all properties
// @access Public
router.post("/get-properties/", async (req, res) => {
  //Grab the property IDs from the array
  const user_to_get_properties_from = await User.find({ email: req.body.email })
    .select("properties")
    .lean();
  //console.log("USER TO GET PROPERTY FROM");
  //console.log(user_to_get_properties_from);
  const property_array = user_to_get_properties_from[0].properties;
  //console.log("\nPROPERTY ARRAY");
  //console.log(property_array);

  //Populate property_array with property info based on the unique ids from above
  //console.log("PROPERTIES FOR ACCOUNT: ");
  const properties_for_user_details = await Property.find({})
    .where("_id")
    .in(property_array)
    .exec();
  //console.log(properties_for_user_details);

  //Send array of properties to render client-side
  res.json(properties_for_user_details);

  //const userProperties = await Property.find({});
  //const id = "62d4c322b0dffaa32af430e6";
  //User.findById(req.params.id, function (err, user) {
  //userProperties = user.properties;
  //console.log(userProperties[0]);
  // try {
  //   res.status(200).json({
  //     status: "Success",
  //     data: {
  //       userProperties,
  //     },
  //   });
  // } catch (err) {
  //   res.status(500).json({
  //     status: "Failed",
  //     message: err,
  //   });
  // }
  // if (err) {
  //   console.log(err);
  // } else {
  //   console.log("User properties: ", user.properties);
  //   userProperties = user.properties;
  // }
  //});
});

// @route GET api/books/:id
// @description Get single book by id
// @access Public
// router.get("/:id", (req, res) => {
//   Property.findById(req.params.id)
//     .then((property) => res.json(property))
//     .catch((err) => res.status(404).json({ message: "No Property found" }));
// });

// @route GET api/properties
// @description add/save property
// @access Public
router.post("/", async (req, res) => {
  const propertyToAdd = new Property({
    ...req.body,
    property_description: req.body.property_description,
    property_cost: req.body.property_cost,
    property_quantity: req.body.property_quantity,
  });

  //const tokenContents = jwt.verify(req.body.token, `${process.env.JWTPRIVATEKEY}`);

  User.findByIdAndUpdate(
    req.body.user_id,
    {
      $push: {
        properties: [propertyToAdd._id],
      },
    },
    function (err, user) {
      if (err) {
        console.log(err);
      } else {
        res.status(500).send({ message: "Property successfully added" });
      }
    }
  );

  await propertyToAdd.save();
});

// @route GET api/properties/:id
// @description Update property
// @access Public
router.patch("/update-property/:id", async (req, res) => {
  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  //Grab the property IDs from the array
  // const user_to_get_properties_from = await User.find({ email: req.body.email })
  //   .select("properties")
  //   .lean();
  // console.log("USER TO GET PROPERTY FROM");
  // console.log(user_to_get_properties_from);
  // const property_array = user_to_get_properties_from[0].properties;

  // const properties_for_user_details = await Property.find({})
  //   .where("_id")
  //   .in(property_array)
  //   .exec();
  //console.log(properties_for_user_details);

  //Send array of properties to render client-side
  //res.json(properties_for_user_details);

  // User.findByIdAndUpdate(
  //   req.body.user_id, // need to send user data/token
  //   {
  //     $set: {
  //       properties: [updatedProperty._id],
  //     },
  //   },
  //   function (err, user) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.status(500).send({ message: "Property successfully updated" });
  //     }
  //   }
  // );

  try {
    res.status(200).json({
      status: "Success",
      data: {
        updatedProperty,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err,
    });
  }

  // Property.findByIdAndUpdate(req.params.id, req.body)
  //   .then((property) => res.json({ msg: "Updated successfully" }))
  //   .catch((err) =>
  //     res.status(400).json({ error: "Unable to update the Database" })
  //   );
});

// @route GET api/properties/:id
// @description Delete properties by id
// @access Public
router.delete("/delete-property/:id", async (req, res) => {
  // await User.findByIdAndUpdate(req.data, {
  //   $pull: { properties: { _id: req.params.id } },
  // });
  await Property.findByIdAndDelete(req.params.id); // doesn't properly delete from user property database

  try {
    res.status(204).json({
      status: "Success",
      data: {},
    });
  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: err,
    });
  }
});

module.exports = router;
