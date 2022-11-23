const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

const Token = require("../models/tokenModel");
const sendEmail = require("../utlis/sendEmail");
const sendVerify = require("../utlis/sendVerifyEmail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    const result = await newuser.save();
    await sendVerify(result, "verifyemail");
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error creating user", success: false, error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    if (user.isVerified === false) {
      return res
        .status(200)
        .send({ message: "User not Verified", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid Credentials", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login successful", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.post("/send-password-reset-link", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      const result = await User.findOne({ email: req.body.email });
      await sendEmail(result, "resetpassword");
      res.send({
        success: true,
        message: "Password reset link sent to your email successfully",
      });
    } else {
      return res
        .status(404)
        .send({ message: "Invalid crediatials", success: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/resetpassword", async (req, res) => {
  try {
    const tokenData = await Token.findOne({ token: req.body.token });
    if (tokenData) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(tokenData.userid, {
        password: hashedPassword,
      });
      res.send({ success: true, message: "Password reset successfull" });
      const data = tokenData.userid;

      const result = await User.findById(data);
      await sendEmail(result, "afterreset");
      const idData = tokenData.userid;
      await Token.findOneAndDelete({ _id: tokenData._id }, { userid: idData });
    } else {
      res.send({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/verifyemail", async (req, res) => {
  try {
    const tokenData = await Token.findOne({ token: req.body.token });
    if (tokenData) {
      await User.findByIdAndUpdate(tokenData.userid, { isVerified: true });
      // await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });

      const data = tokenData.userid;
      console.log("Data : ", data);
      const data2 = req.body.token;
      console.log("Data2 : ", data2);
      await Token.findOneAndDelete({ token: req.body.token });
      res.send({ success: true, message: "Email Verified Successlly" });
      const result = await User.findById(data);
      await sendVerify(result, "afterverify");
    } else {
      res.send({ success: false, message: "Invalid token" });
      console.log(error);
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

module.exports = router;
