const groupsRouter = require("express").Router();
const Group = require("../models/group");
const User = require("../models/users");
const ObjectId = require("mongoose").Types.ObjectId;

groupsRouter.get("/", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const groups = await Group.find({ user: req.decodedToken.id }).populate("user", { username: 1, name: 1 });

  if (groups.length !== 0) {
    res.json(groups);
  } else {
    res.status(204).end();
  }
});

groupsRouter.get("/:id", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).end();
  }

  const group = await Group.findById(req.params.id).populate("user", { username: 1, name: 1 });

  if (group.user.id !== req.decodedToken.id) {
    res.status(403).end();
  } else if (group) {
    res.json(group);
  } else {
    res.status(404).end();
  }
});

groupsRouter.delete("/:id", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(req.decodedToken.id);
  const removedGroup = await Group.findById(req.params.id);

  if (removedGroup && removedGroup.user.toString() !== req.decodedToken.id) {
    res.status(403).end();
    return;
  }

  if (removedGroup) {
    await Group.deleteOne({ _id: req.params.id });

    // we also need to remove the group from the user document
    user.groups = user.groups.filter(groupId => groupId.toString() !== removedGroup.id);
    await user.save();

    res.status(204).end();
  }

  res.status(404).end();
});

groupsRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const user = await User.findById(req.decodedToken.id);

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

  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const group = await Group.findById(req.params.id);
  if (group && group.user.toString() !== req.decodedToken.id) {
    res.status(403).end();
    return;
  }

  const user = await User.findById(req.decodedToken.id);

  const modifiedGroup = {
    name: body.name,
    weeklyRations: body.weeklyRations,
    user: user._id
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
