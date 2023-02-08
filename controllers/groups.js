const groupsRouter = require("express").Router();
const Group = require("../models/group");
const User = require("../models/users");

groupsRouter.get("/", (req, res, next) => {
  Group.find({})
    .populate("user", { username: 1, name: 1 })
    .then(groups => {
      res.json(groups);
    })
    .catch((error) => next(error));
  /*   try {
      const groups = Group.find({});
      res.json(groups);
    } catch (exception) {
      next(exception);
    } */
});

groupsRouter.get("/:id", async (req, res) => {
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

  res.json(updatedGroup);
});

module.exports = groupsRouter;
