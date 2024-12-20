const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
     email: {
          type: String,
          required: true,
     },
     otp: {
          type: String,
          required: true,
     },
     createdAt: {
          type: Date,
          default: Date.now(),
          expires: 5 * 60,     //5 minutes baad expire ho jaegi otp
     }
});

//in order to make sure that user is  verified by otp,we have to  first check for otp,then only create entr if otp is right

async function sendVerificationEmail(email, otp) {

     try {
          const mailResponse = await mailSender(email, "Verification Email from StudyNotion", otp);
          console.log("Email sent success", mailResponse);
     }
     catch (error) {
          console.log("error occurs while sending mail.", error);
          throw error;
     }
}

OTPSchema.pre("save", async function (next) {
     await sendVerificationEmail(this.email, this.otp);
     next();
});

module.exports = mongoose.model("OTP", OTPSchema);