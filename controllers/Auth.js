const bcrypt = require("bcryptjs")
const Joi = require('joi')
const User = require("../models/User")

const jwt = require("jsonwebtoken")

require("dotenv").config()


const signupSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).required(),
    lastName: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required()
      .messages({ 'any.only': 'Password and Confirm Password do not match' }),
    accountType: Joi.string().valid('admin').optional(),  // Example account types
  });
  
  exports.signup = async (req, res) => {
    try {

      const { error } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
  

      const { firstName, lastName, email, password, accountType } = req.body;
  

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please sign in to continue.",
        });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10);
  

      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType,
      });
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      });
    }
  };


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {

      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }


    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}