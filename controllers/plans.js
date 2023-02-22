const plansRouter = require("express").Router();
const Plan = require("../models/plan");
const Meal = require("../models/meal");
const User = require("../models/users");
const ObjectId = require("mongoose").Types.ObjectId;

plansRouter.get("/", async (req, res) => {
  const plans = await Plan.find({})
    .populate({
      path: "lunch",
      select: { name: 1, group: 1, timeOfDay: 1, numberOfDays: 1 },
      populate: { path: "group", select: { name: 1 } },
    })
    .populate({
      path: "dinner",
      select: { name: 1, group: 1, timeOfDay: 1, numberOfDays: 1 },
      populate: { path: "group", select: { name: 1 } },
    })
    .populate({
      path: "user",
      select: { username: 1, name: 1 }
    });

  res.json(plans);
});

plansRouter.get("/:id", async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).end();
  }

  const plan = await Plan.findById(req.params.id)
    .populate({
      path: "lunch",
      select: { name: 1, group: 1, timeOfDay: 1, numberOfDays: 1 },
      populate: { path: "group", select: { name: 1 } },
    })
    .populate({
      path: "dinner",
      select: { name: 1, group: 1, timeOfDay: 1, numberOfDays: 1 },
      populate: { path: "group", select: { name: 1 } },
    })
    .populate({
      path: "user",
      select: { username: 1, name: 1 }
    });

  if (plan) {
    res.json(plan);
  } else {
    res.status(404).end();
  }
});

plansRouter.delete("/:id", async (req, res) => {
  const removedPlan = await Plan.findByIdAndRemove(req.params.id);
  const user = await User.findById(removedPlan.user);

  // we also need to remove the plan from the user document
  user.plans = user.plans.filter(planId => planId.toString() !== removedPlan.id);
  await user.save();

  res.status(204).end();
});

plansRouter.post("/", async (req, res) => {
  const body = req.body;

  if (!req.body.userId) {
    res.status(400).end();
  }

  const user = await User.findById(body.userId);

  const lunchIds = [];
  for (const meal of body.lunch) {
    const mealToAdd = await Meal.findOne({ name: meal });
    lunchIds.push(mealToAdd._id);
  }

  const dinnerIds = [];
  for (const meal of body.dinner) {
    const mealToAdd = await Meal.findOne({ name: meal });
    dinnerIds.push(mealToAdd._id);
  }

  const newPlan = new Plan({
    name: body.name,
    lunch: lunchIds,
    dinner: dinnerIds,
    user: body.userId
  });

  const savedPlan = await newPlan.save();

  const populatedPlan = await Plan.populate(savedPlan, [
    { path: "lunch", populate: { path: "group" } },
    { path: "dinner", populate: { path: "group" } }
  ]);

  user.plans = user.plans.concat(savedPlan._id);
  await user.save();

  res.status(201).json(populatedPlan);
});

plansRouter.put("/:id", async (req, res) => {
  const body = req.body;

  const lunchIds = [];
  for (const meal of body.lunch) {
    const mealToAdd = await Meal.findOne({ name: meal });
    lunchIds.push(mealToAdd._id);
  }

  const dinnerIds = [];
  for (const meal of body.dinner) {
    const mealToAdd = await Meal.findOne({ name: meal });
    dinnerIds.push(mealToAdd._id);
  }

  const planToUpdate = {
    name: body.name,
    lunch: lunchIds,
    dinner: dinnerIds,
    user: body.userId
  };

  const updatedPlan = await Plan.findByIdAndUpdate(req.params.id, planToUpdate, {
    new: true,
    runValidators: true,
    context: "query",
  });

  const populatedPlan = await Plan.populate(updatedPlan, [
    { path: "lunch", populate: { path: "group" } },
    { path: "dinner", populate: { path: "group" } }
  ]);

  if (populatedPlan) {
    res.json(populatedPlan);
  } else {
    res.status(404).end();
  }
});

module.exports = plansRouter;
