const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/users");

usersRouter.get("/", async (req, res) => {
  const users = await User
    .find({})
    .populate("groups", { name: 1, weeklyRations: 1 })
    .populate("meals")
    .populate("plans");

  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  res.status(201).json(savedUser);
});

module.exports = usersRouter;