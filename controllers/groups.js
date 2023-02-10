const groupsRouter = require("express").Router();
const Group = require("../models/group");
const User = require("../models/users");
const ObjectId = require("mongoose").Types.ObjectId;

groupsRouter.get("/", async (req, res) => {
  const groups = await Group.find({}).populate("user", { username: 1, name: 1 });
  res.json(groups);
});

groupsRouter.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).end();
  }

  const group = await Group.findById(req.params.id);

  if (group) {
    res.json(group);
  } else {
    res.status(404).end();
  }
});

groupsRouter.delete("/:id", async (req, res) => {
  await Group.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

groupsRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!req.body.userId) {
    res.status(400).end();
  }

  const user = await User.findById(body.userId);

  const group = new Group({
    name: body.name,
    weeklyRations: body.weeklyRations,
    user: user._id,
  });

  const savedGroup = await group.save();
  user.groups = user.groups.concat(savedGroup._id);
  await user.save();

  res.status(201).json(savedGroup);
});

groupsRouter.put("/:id", async (req, res) => {
  const body = req.body;

  const modifiedGroup = {
    name: body.name,
    weeklyRations: body.weeklyRations,
  };

  const updatedGroup = await Group.findByIdAndUpdate(req.params.id, modifiedGroup, {
    new: true,
    runValidators: true,
    context: "query",
  });

  if (updatedGroup) {
    res.json(updatedGroup);
  } else {
    res.status(404).end();
  }
});

module.exports = groupsRouter;
