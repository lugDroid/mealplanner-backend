const mealsRouter = require("express").Router();
const Meal = require("../models/meal");
const Group = require("../models/group");

mealsRouter.get("/", (req, res) => {
  Meal.find({})
    .populate("group")
    .then((meals) => {
      res.json(meals);
    });
});

mealsRouter.get("/:id", (req, res) => {
  Meal.findById(req.params.id)
    .populate("group")
    .then((meal) => {
      if (meal) {
        res.json(meal);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

mealsRouter.delete("/:id", (req, res) => {
  Meal.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

mealsRouter.post("/", (req, res) => {
  const body = req.body;

  Group.findOne({ name: body.group }).then((group) => {
    body.group = group._id;
    const newMeal = new Meal({
      name: body.name,
      group: body.group,
      timeOfDay: body.timeOfDay,
      numberOfDays: body.numberOfDays,
    });

    newMeal
      .save()
      .then((savedMeal) => {
        savedMeal.group = group;
        res.json(savedMeal);
      })
      .catch((error) => next(error));
  });
});

mealsRouter.put("/:id", (req, res) => {
  const body = req.body;

  Group.findOne({ name: body.group }).then((group) => {
    body.group = group.id;

    const modifiedMeal = {
      name: body.name,
      group: body.group,
      timeOfDay: body.timeOfDay,
      numberOfDays: body.numberOfDays,
    };

    Meal.findByIdAndUpdate(req.params.id, modifiedMeal, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate("group")
      .then((updatedMeal) => {
        res.json(updatedMeal);
      })
      .catch((error) => next(error));
  });
});

module.exports = mealsRouter;
