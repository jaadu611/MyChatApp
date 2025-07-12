const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");

const { generateToken } = require("../lib/utils.js");
const cloudinary = require("../lib/cloudinary.js");

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = generateToken(newUser, res);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture || null,
      },
    });
  } catch (error) {
    console.warn("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  User.findOne({ email })
    .then(async (user) => {
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = generateToken(user, res);
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture || null,
        },
      });
    })
    .catch((error) => {
      console.warn("Error during login:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

const logout = (req, res) => {
  try {
    res.clearCookie("JWT", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.warn("Error during logout:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user._id;

    if (!profilePicture) {
      return res.status(400).json({ error: "Profile picture is required" });
    }

    const uploadResponce = await cloudinary.uploader.upload(profilePicture);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponce.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.warn("Error updating user profile:", error);
  }
};

const checkAuth = (req, res) => {
  try {
    const { _id, fullName, email, profilePicture } = req.user;
    res.status(200).json({
      id: _id,
      fullName,
      email,
      profilePicture: profilePicture || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signup, login, logout, userProfile, checkAuth };
