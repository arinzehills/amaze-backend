// importing user context
const User = require("../models/user.model");
const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const fs = require("fs");
const upload = require("../middleware/multer");
const cloudinary = require("../config/cloudinary.js");
const userController = require("../controllers/user.controller");

// const app = express();

const router = express.Router();

router.get("/showhomepage", async (req, res) => {
  res.send("Hellos");
});
const jwt = require("jsonwebtoken");
router.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res
        .status(400)
        .json({ success: false, message: "All input is required" });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res
        .status(409)
        .json({ success: false, message: "User Already Exist. Please Login" });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      full_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        // expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(200).json({
      success: true,
      message: "User registered in Successfully 🙌 ",
      user: user,
    });
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

router.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res
        .status(400)
        .json({ success: false, message: "All input is required" });
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.ACCESS_TOKEN_SECRET
      );

      // save user token
      user.token = token;

      // user
      return res.status(200).json({
        success: true,
        message: "Logged in Successfully 🙌 ",
        user: user,
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

router.post("/updateUser", auth, async (req, res) => {
  var data = req.body;
  function clean(obj) {
    for (var propName in obj) {
      if (
        obj[propName] === null ||
        obj[propName] === undefined ||
        obj[propName] === ""
      ) {
        delete obj[propName];
      }
    }
    return obj;
  }
  console.log("data");
  console.log(data);
  console.log(clean(data));
  await User.findByIdAndUpdate(req.user.user_id, req.body, {
    useFindAndModify: false,
  });
  var user = await User.findById(req.user.user_id).lean();
  return res.status(200).json({
    success: true,
    message: "Data updated successfully 🙌 ",
    user: user,
  });
});
const uploadPicture = upload.single("image");

router.post("/updateProfilePicture", auth, async (req, res) => {
  console.log("profile dp is hitted");
  uploadPicture(req, res, async function (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ message: err.message });
    }
    const uploader = async (path) => await cloudinary.uploads(path, "Profile");

    try {
      var user = await User.findById(req.user.user_id).lean();
      var delRes = await userController.deleteUserProfilePic(user);
      const path = req.file.path;
      const newPath = await uploader(path);
      fs.unlinkSync(path);
      const dattoUpdate = {
        profilePicture: newPath.url,
      };
      let newUser = await User.findByIdAndUpdate(
        req.user.user_id,
        dattoUpdate,
        {
          useFindAndModify: false,
        }
      );
      // console.log(user);
      res.status(200).json({
        success: true,
        message: "Profile picture updated 🙌",
        user: newUser,
      });
    } catch (error) {
      console.log(error);
    }
  });
});
router.post("/getUser", auth, async (req, res) => {
  // console.log(req.user)

  let user = await User.findById(req.user.user_id).select("-password");
  res.status(200).json({
    success: true,
    message: "Info retrieved successfully 🙌 ",
    user: user,
  });
});
router.post("/getAUser", auth, async (req, res) => {
  let user = await User.findById(req.body.user_id).select("-password");
  res.status(200).json({
    success: true,
    message: "Info retrieved successfully 🙌",
    user: user,
  });
});
router.post("/getAllUsers", async (req, res) => {
  User.find({}, function (err, users) {
    res.status(200).json(users);
  }).select("-password");
});

module.exports = router;
