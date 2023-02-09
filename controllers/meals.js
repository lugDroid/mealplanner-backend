const mealsRouter = require("express").Router();
const Meal = require("../models/meal");
const Group = require("../models/group");

mealsRouter.get("/", async (req, res) => {
  const meals = await Meal.find({}).populate("group");
  res.json(meals);
});

mealsRouter.get("/:id", async (req, res) => {
  const meal = await Meal.findById(req.params.id).populate("group");

  if (meal) {
    res.json(meal);
  } else {
    res.status(404).end();
  }
});

mealsRouter.delete("/:id", async (req, res) => {
  const foundMeal = await Meal.findByIdAndRemove(req.params.id);

  if (!foundMeal) {
    res.status(404).end();
  }

  res.status(204).end();
});

mealsRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!body.name) {
    res.status(400).end();
    throw Error("name required");
  }

  if (!body.group) {
    res.status(400).end();
    throw Error("group required");
  }

  if (!body.timeOfDay) {
    res.status(400).end();
    throw Error("time of day required");
  }

  if (!body.numberOfDays) {
    res.status(400).end();
    throw Error("number of days required");
  }

  const group = await Group.findOne({ name: body.group });
  body.group = group._id;
  const newMeal = new Meal({
    name: body.name,
    group: body.group,
    timeOfDay: body.timeOfDay,
    numberOfDays: body.numberOfDays,
  });

  const savedMeal = newMeal.save();
  savedMeal.group = group;
  res.status(201).json(savedMeal);
});

mealsRouter.put("/:id", async (req, res) => {
  const body = req.body;

  const group = await Group.findOne({ name: body.group });
  body.group = group.id;

  const modifiedMeal = {
    name: body.name,
    group: body.group,
    timeOfDay: body.timeOfDay,
    numberOfDays: body.numberOfDays,
  };

  const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, modifiedMeal, {
    new: true,
    runValidators: true,
    context: "query",
  }).populate("group");

  if (updatedMeal) {
    res.json(updatedMeal);
  } else {
    res.status(404).end();
  }
});

module.exports = mealsRouter;
