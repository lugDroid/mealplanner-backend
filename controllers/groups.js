const groupsRouter = require("express").Router();
const Group = require("../models/group");

groupsRouter.get("/", (req, res) => {
  Group.find({}).then((groups) => {
    res.json(groups);
  });
});

groupsRouter.get("/:id", async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (group) {
      res.json(group);
    } else {
      res.status(404).end();
    }
  } catch (exception) {
    next(exception);
  }

});

groupsRouter.delete("/:id", async (req, res, next) => {
  try {
    await Group.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } catch (exception) {
    next(exception);
  }
});

groupsRouter.post("/", async (req, res, next) => {
  const body = req.body;

  const group = new Group({
    name: body.name,
    weeklyRations: body.weeklyRations,
  });

  try {
    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (exception) {
    next(exception);
  }

});

groupsRouter.put("/:id", (req, res, next) => {
  const body = req.body;

  const modifiedGroup = {
    name: body.name,
    weeklyRations: body.weeklyRations,
  };

  Group.findByIdAndUpdate(req.params.id, modifiedGroup, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedGroup) => {
      res.json(updatedGroup);
    })
    .catch((error) => next(error));
});

module.exports = groupsRouter;
