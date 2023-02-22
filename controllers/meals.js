const mealsRouter = require("express").Router();
const Meal = require("../models/meal");
const Group = require("../models/group");
const User = require("../models/users");

mealsRouter.get("/", async (req, res) => {
  const meals = await Meal.find({})
    .populate("group", { name: 1, weeklyRations: 1 })
    .populate("user", { username: 1, name: 1 });

  res.json(meals);
});

mealsRouter.get("/:id", async (req, res) => {
  const meal = await Meal.findById(req.params.id)
    .populate("group", { name: 1, weeklyRations: 1 })
    .populate("user", { username: 1, name: 1 });

  if (meal) {
    res.json(meal);
  } else {
    res.status(404).end();
  }
});

mealsRouter.delete("/:id", async (req, res) => {
  const foundMeal = await Meal.findByIdAndRemove(req.params.id);
  const user = await User.findById(foundMeal.user);

  // we also need to remove the meal from the user document
  user.meals = user.meals.filter(mealId => mealId.toString() !== foundMeal.id);
  await user.save();

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

  if (!body.userId) {
    res.status(400).end();
    throw Error("user required");
  }

  if (!body.timeOfDay) {
    res.status(400).end();
    throw Error("time of day required");
  }

  if (!body.numberOfDays) {
    res.status(400).end();
    throw Error("number of days required");
  }
  const user = await User.findById(body.userId);
  const group = await Group.findOne({ name: body.group });

  if (!group) {
    res.status(400).end();
    throw Error("existing group required");
  }

  body.group = group._id;
  const newMeal = new Meal({
    name: body.name,
    group: body.group,
    userId: body.userId,
    timeOfDay: body.timeOfDay,
    numberOfDays: body.numberOfDays,
    user: user._id
  });

  const savedMeal = await newMeal.save();
  const populatedMeal = await Meal
    .populate(savedMeal, [
      { path: "user", select: { username: 1, name: 1 } },
      { path: "group", select: { name: 1, weeklyRations: 1 } }
    ]);

  user.meals = user.meals.concat(savedMeal._id);
  await user.save();

  res.status(201).json(populatedMeal);
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
    user: body.userId
  };

  const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, modifiedMeal, {
    new: true,
    runValidators: true,
    context: "query",
  }).populate("group", { name: 1, weeklyRations: 1 })
    .populate("user", { username: 1, name: 1 });

  if (updatedMeal) {
    res.json(updatedMeal);
  } else {
    res.status(404).end();
  }
});

module.exports = mealsRouter;
