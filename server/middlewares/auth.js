const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//auth 
exports.auth = async (req, res, next) => {
     try {
          //extract token
          const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");
        

          //if token missing
          // console.log("token is:"  + token);
          if (!token) {
               return res.status(401).json({
                    success: false,
                    message: 'Token is missing.',
                    
               });
          }

          //verify the token
          try {
          
               const decode = jwt.verify(token, process.env.JWT_SECRET,{ clockTolerance: 5 });
               console.log(decode);
               req.user = decode;
          }
          catch (error) {
               //verfication-issue
               return res.status(401).json({
                    success: false,
                    message:error.message,
               });

          }
          next();
     }
     catch (error) {
          return res.status(401).json({
               success: false,
               message: 'Something went wrong while validating the token',
          });
     }
}

//isStudent

exports.isStudent = async (req, res, next) => {
     try {
          if (req.user.accountType != "Student") {
               return res.status(401).json({
                    success: false,
                    message: 'This is a protected route for Students',
               });
          }
          next();

     }
     catch (error) {
          return res.status(500).json({
               success: false,
               message: 'There is some error!',
          })
     }
}

//isInstructor
exports.isInstructor = async (req, res, next) => {
     try {
          if (req.user.accountType != "Instructor") {
               return res.status(401).json({
                    success: false,
                    message: 'This is a protected route for Instructor',
               });
          }
          next();

     }
     catch (error) {
          return res.status(500).json({
               success: false,
               message: 'There is some error!',
          })
     }
}
//isAdmin 

exports.isAdmin = async (req, res, next) => {
     try {
          if (req.user.accountType != "Admin") {
               return res.status(401).json({
                    success: false,
                    message: 'This is a protected route for Admin',
               });
          }
          next();

     }
     catch (error) {
          return res.status(500).json({
               success: false,
               message: 'There is some error!',
          })
     }
}