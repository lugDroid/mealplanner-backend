const plansRouter = require("express").Router();
const Plan = require("../models/plan");
const Meal = require("../models/meal");

plansRouter.get("/", (req, res) => {
  Plan.find({})
    .populate({
      path: "lunch",
      populate: { path: "group" },
    })
    .populate({
      path: "dinner",
      populate: { path: "group" },
    })
    .then((plans) => {
      res.json(plans);
    });
});

plansRouter.get("/:id", (req, res) => {
  Plan.findById(req.params.id)
    .populate("lunch")
    .populate("dinner")
    .then((plan) => {
      if (plan) {
        res.json(plan);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

plansRouter.delete("/:id", (req, res) => {
  Plan.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

plansRouter.post("/", (req, res) => {
  const body = req.body;
  lunchPromises = [];
  for (const meal of body.lunch) {
    lunchPromises.push(Meal.findOne({ name: meal.name }));
  }

  dinnerPromises = [];
  for (const meal of body.dinner) {
    dinnerPromises.push(Meal.findOne({ name: meal.name }));
  }

  Promise.all([
    Promise.all(lunchPromises).then((meals) => meals.map((m) => m._id)),
    Promise.all(dinnerPromises).then((meals) => meals.map((m) => m._id)),
  ]).then(([lunchIds, dinnerIds]) => {
    const newPlan = new Plan({
      name: body.name,
      lunch: lunchIds,
      dinner: dinnerIds,
    });

    newPlan
      .save()
      .then(async (savedPlan) => {
        await savedPlan.populate({
          path: "lunch",
          populate: { path: "group" },
        });

        await savedPlan.populate({
          path: "dinner",
          populate: { path: "group" },
        });

        res.json(savedPlan);
      })
      .catch((error) => next(error));
  });
});

plansRouter.put("/:id", (req, res) => {
  const body = req.body;

  lunchPromises = [];
  for (const meal of body.lunch) {
    lunchPromises.push(Meal.findOne({ name: meal.name }));
  }

  dinnerPromises = [];
  for (const meal of body.dinner) {
    dinnerPromises.push(Meal.findOne({ name: meal.name }));
  }

  Promise.all([
    Promise.all(lunchPromises).then((meals) => meals.map((m) => m._id)),
    Promise.all(dinnerPromises).then((meals) => meals.map((m) => m._id)),
  ]).then(([lunchIds, dinnerIds]) => {
    const modifiedPlan = {
      name: body.name,
      lunch: lunchIds,
      dinner: dinnerIds,
    };

    Plan.findByIdAndUpdate(req.params.id, modifiedPlan, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate({
        path: "lunch",
        populate: { path: "group" },
      })
      .populate({
        path: "dinner",
        populate: { path: "group" },
      })
      .then((updatedPlan) => {
        res.json(updatedPlan);
      })
      .catch((error) => next(error));
  });
});

module.exports = plansRouter;
