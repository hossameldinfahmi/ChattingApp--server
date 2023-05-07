const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const genetrateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all fields");
  }
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name: name,
    email: email,
    password: password,
    pic: pic,
  });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: genetrateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong, Faild to freate user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please enter all fields");
    }
    const user = await User.findOne({ email: email });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: genetrateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(500);
    throw new Error(`Server Error: ${error.message}`);
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search;

  const query = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { email: { $regex: keyword, $options: "i" } },
        ],
      }
    : {};

  try {
    const users = await User.find(query);

    res.status(200).json(users);
  } catch (error) {
    res.status(500);
    throw new Error(`Server Error: ${error.message}`);
  }
});

module.exports = { registerUser, authUser, allUsers };
