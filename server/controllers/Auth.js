const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
const { otpTemplate } = require("../mail/templates/emailVerificationTemplate");
//sendOtp
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request ki body
    const { email } = req.body;

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "Email already registered",
      });
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("OTP is:", otp);

    //cheque unique otp or not
    var result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      console.log("OTP is:", otp);

      //cheque unique otp or not
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry for otp

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    await mailSender(email, "OTP Verfication Code", otpTemplate(otp));
    //return resposne success
    res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signUp

exports.signUp = async (req, res) => {
  try {
    //data fetch from req ki body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      (!firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !contactNumber ||
        !accountType,
      !otp)
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required.",
      });
    }
    // 2 psswrd match krlo

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password does not matched.",
      });
    }

    //check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //find most recent OTP stored for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log(recentOtp);
    //validate otp
    if (recentOtp[0]?.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP,Check Again.",
      });
    }

    //hash krlo psswrd
    const hashedPassword = await bcrypt.hash(password, 10);
    //create entry in DB
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);
    const ProfileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: ProfileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      token: "123",
    });

    const payload = {
      id: user._id,
      email: user.email,
      accountType: user.accountType,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Save token to user record
    user.token = token;
    await user.save();

    //return res
    return res.status(200).json({
      success: true,
      message: "user Created successfully.",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user cannot be registered,do try again.",
    });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    //fetch data from req ki body
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //user check exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Do register first.",
      });
    }
    //passwrod match
    if (await bcrypt.compare(password, user.password)) {
      //generate JWT token
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      // user.password = undefined;
      user.save();
      //create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100), //will exppire after 3 day
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Passwrd is Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failure,do try again",
    });
  }
};

//changePassword

exports.changePassword = async (req, res) => {
  try {
    // Extract user ID from the JWT token
    const userId = req.user.id; // Assuming `req.user` is set via authentication middleware

    // Extract old password, new password, and confirmation from the request body
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if the new password and confirmation match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match",
      });
    }

    // Fetch user from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare old password with the stored hash
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedNewPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    await mailSender(
      user.email,
      "Password changed Successfully",
      passwordUpdated(
        user.email,
        `Password updated successfully for ${user.firstName} ${user.lastName}`
      )
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
    });
  }
};
