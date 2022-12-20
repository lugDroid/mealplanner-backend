require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();
const Group = require("./models/group");
const Meal = require("./models/meal");
const Plan = require("./models/plan");

app.use(express.static("build"));
app.use(express.json());
app.use(cors());

mongoose.set("strictQuery", false);
const url = process.env.MONGODB_URI;

console.log("Connecting to MongoDB");
mongoose
  .connect(url)
  .then((result) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "Malformatted Id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/api/meals", (req, res) => {
  Meal.find({})
    .populate("group")
    .then((meals) => {
      res.json(meals);
    });
});

app.get("/api/meals/:id", (req, res) => {
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

app.delete("/api/meals/:id", (req, res) => {
  Meal.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/meals", (req, res) => {
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
        res.json(savedMeal);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/meals/:id", (req, res) => {
  const body = req.body;

  Group.findOne({ name: body.group }).then((group) => {
    body.group = group.id;

    const modifiedMeal = {
      name: body.name,
      group: body.group,
      timeOfDay: body.timeOfDay,
      numberOfDays: body.numberOfDays,
    };

    Meal.findByIdAndUpdate(req.params.id, modifiedMeal, { new: true })
      .then((updatedMeal) => {
        res.json(updatedMeal);
      })
      .catch((error) => next(error));
  });
});

app.get("/api/groups", (req, res) => {
  Group.find({}).then((groups) => {
    res.json(groups);
  });
});

app.get("/api/groups/:id", (req, res) => {
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

app.delete("/api/groups/:id", (req, res) => {
  Group.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/groups", (req, res) => {
  const body = req.body;

  const group = new Group({
    name: body.name,
    weeklyRations: body.weeklyRations,
  });

  group
    .save()
    .then((savedGroup) => {
      res.json(savedGroup);
    })
    .catch((error) => next(error));
});

app.put("/api/groups/:id", (req, res) => {
  const body = req.body;

  const modifiedGroup = {
    name: body.name,
    weeklyRations: body.weeklyRations,
  };

  Group.findByIdAndUpdate(req.params.id, modifiedGroup, { new: true })
    .then((updatedGroup) => {
      res.json(updatedGroup);
    })
    .catch((error) => next(error));
});

app.get("/api/plans", (req, res) => {
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

app.get("/api/plans/:id", (req, res) => {
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

app.delete("/api/plans/:id", (req, res) => {
  Plan.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/plans", (req, res) => {
  const body = req.body;

  lunchPromises = [];
  for (const mealName of body.lunch) {
    lunchPromises.push(Meal.findOne({ name: mealName }));
  }

  dinnerPromises = [];
  for (const mealName of body.dinner) {
    dinnerPromises.push(Meal.findOne({ name: mealName }));
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
      .then((savedPlan) => {
        res.json(savedPlan);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/plans/:id", (req, res) => {
  const body = req.body;

  lunchPromises = [];
  for (const mealName of body.lunch) {
    lunchPromises.push(Meal.findOne({ name: mealName }));
  }

  dinnerPromises = [];
  for (const mealName of body.dinner) {
    dinnerPromises.push(Meal.findOne({ name: mealName }));
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

    Plan.findByIdAndUpdate(req.params.id, modifiedPlan, { new: true })
      .then((updatedPlan) => {
        res.json(updatedPlan);
      })
      .catch((error) => next(error));
  });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};

app.use(unknownEndpoint);
app.use(errorHandler); // This has to be the last loaded middleware

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
