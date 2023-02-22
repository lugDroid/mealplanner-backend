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

  const group = await Group.findById(req.params.id).populate("user", { username: 1, name: 1 });

  if (group) {
    res.json(group);
  } else {
    res.status(404).end();
  }
});

groupsRouter.delete("/:id", async (req, res) => {
  const removedGroup = await Group.findByIdAndRemove(req.params.id);
  const user = await User.findById(removedGroup.user);

  // we also need to remove the group from the user document
  user.groups = user.groups.filter(groupId => groupId.toString() !== removedGroup.id);
  await user.save();

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
  const populatedGroup = await Group.populate(savedGroup, { path: "user", select: { username: 1, name: 1 } });
  user.groups = user.groups.concat(savedGroup._id);
  await user.save();

  res.status(201).json(populatedGroup);
});

groupsRouter.put("/:id", async (req, res) => {
  const body = req.body;

  const modifiedGroup = {
    name: body.name,
    weeklyRations: body.weeklyRations,
    user: body.userId
  };

  const updatedGroup = await Group.findByIdAndUpdate(req.params.id, modifiedGroup, {
    new: true,
    runValidators: true,
    context: "query",
  }).populate("user", { username: 1, name: 1 });

  if (updatedGroup) {
    res.json(updatedGroup);
  } else {
    res.status(404).end();
  }
});

module.exports = groupsRouter;
