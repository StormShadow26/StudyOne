const User = require("../models/User");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  //get email form req ki body
  try {
    const email = req.body.email;

    console.log("email:", email);
    //check user for this email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url
    //link generate kro frontend pe
    const url = `https://localhost:3000/update-password/${token}`;
    //send mail containing the url

    await mailSender(
      email,
      "Password Reset Link",
      `Click on given link:${url}`
    );

    //return response
    return res.json({
      success: true,
      message: "Email successfully sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "SomeThig went wrong.",
    });
  }
};

//resetPassword
exports.resetPassword = async (req, res) => {
  try {
    // Fetch data
    const { password, confirmPassword, token } = req.body;
    const userId = req.user?.id;
    console.log(userId);
    // Ensure data is present
    if (!userId || !password || !confirmPassword || !token) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    // Validation: Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Get user details by ID
    const userDetails = await User.findById(userId);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify the token matches and has not expired
    if (userDetails.token !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token is expired, please regenerate the link",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password
    await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword, token: null, resetPasswordExpires: null },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
