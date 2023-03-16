const mealsRouter = require("express").Router();
const Meal = require("../models/meal");
const Group = require("../models/group");
const User = require("../models/users");
const ObjectId = require("mongoose").Types.ObjectId;


mealsRouter.get("/", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const meals = await Meal.find({ user: req.decodedToken.id })
    .populate("group", { name: 1, weeklyRations: 1 })
    .populate("user", { username: 1, name: 1 });

  if (meals.length !== 0) {
    res.json(meals);
  } else {
    res.status(204).end();
  }

});

mealsRouter.get("/:id", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).end();
  }

  const meal = await Meal.findById(req.params.id)
    .populate("group", { name: 1, weeklyRations: 1 })
    .populate("user", { username: 1, name: 1 });

  if (meal.user.id !== req.decodedToken.id) {
    res.status(403).end();
  } else if (meal) {
    res.json(meal);
  } else {
    res.status(404).end();
  }
});

mealsRouter.delete("/:id", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const foundMeal = await Meal.findById(req.params.id);

  if (foundMeal && foundMeal.user.toString() !== req.decodedToken.id) {
    res.status(403).end();
    return;
  }

  if (foundMeal) {
    await Meal.deleteOne({ _id: req.params.id });

    // we also need to remove the meal from the user document
    const user = await User.findById(foundMeal.user);
    user.meals = user.meals.filter(mealId => mealId.toString() !== foundMeal.id);
    await user.save();

    res.status(204).end();
  }

  res.status(404).end();
});

mealsRouter.post("/", async (req, res) => {
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

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

  const user = await User.findById(req.decodedToken.id);
  const group = await Group.findOne({ name: body.group });

  if (!group) {
    res.status(400).end();
    throw Error("existing group required");
  }

  body.group = group._id;
  const newMeal = new Meal({
    name: body.name,
    group: body.group,
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
  if (!req.decodedToken) {
    return res.status(401).json({ error: "invalid token" });
  }

  const body = req.body;

  const meal = await Meal.findById(req.params.id);
  if (meal && meal.user.toString() !== req.decodedToken.id) {
    res.status(403).end();
    return;
  }

  const group = await Group.findOne({ name: body.group });
  body.group = group.id;

  const modifiedMeal = {
    name: body.name,
    group: body.group,
    timeOfDay: body.timeOfDay,
    numberOfDays: body.numberOfDays,
    user: req.decodedToken.id
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
