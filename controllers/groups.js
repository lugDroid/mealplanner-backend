const groupsRouter = require("express").Router();
const Group = require("../models/group");

groupsRouter.get("/", (req, res, next) => {
  Group.find({}).then((groups) => {
    res.json(groups);
  });
});

groupsRouter.get("/:id", (req, res, next) => {
  Group.findById(req.params.id)
    .then((group) => {
      if (group) {
        res.json(group);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

groupsRouter.delete("/:id", (req, res, next) => {
  Group.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

groupsRouter.post("/", (req, res, next) => {
  const body = req.body;

  const group = new Group({
    name: body.name,
    weeklyRations: body.weeklyRations,
  });

  group
    .save()
    .then((savedGroup) => {
      res.status(201).json(savedGroup);
    })
    .catch((error) => next(error));
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
