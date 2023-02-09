const Group = require("../models/group");
const Meal = require("../models/meal");

const initialGroups = [
  {
    name: "Tortillas/Revueltos",
    weeklyRations: 6,
  },
  {
    name: "Pasta",
    weeklyRations: 4,
  },
];

const initialMeals = [
  {
    name: "Pasta con carne y bechamel",
    group: "Pasta",
    timeOfDay: "Lunch",
    numberOfDays: 2,
  },
  {
    name: "Tortilla de patatas",
    group: "Tortillas/Revueltos",
    timeOfDay: "Dinner",
    numberOfDays: 1,
  },
];

const populateMeals = async (savedGroups) => {
  const mealsWithGroupId = [];

  for (const meal of initialMeals) {
    const group = savedGroups.find(g => g.name == meal.group);
    const mealWithGroupId = { ...meal, group: group._id.toString() };
    mealsWithGroupId.push(mealWithGroupId);
  }

  return mealsWithGroupId;
};

const mealsInDb = async () => {
  const meals = await Meal.find({});
  const mealsWithGroupName = [];

  for (const meal of meals) {
    const group = await Group.findById(meal.group);

    mealsWithGroupName.push({
      id: meal._id,
      name: meal.name,
      group: group.name,
      timeOfDay: meal.timeOfDay,
      numberOfDays: meal.numberOfDays,
    });
  }

  return mealsWithGroupName; //.map(meal => meal.toJSON());
};

const nonExistingId = async () => {
  const meal = new Meal({
    name: "To be removed",
    group: "507f1f77bcf86cd799439011",
    timeOfDay: "Lunch",
    numberOfDays: 0,
  });

  await meal.save();
  await meal.remove();

  return meal._id.toString();
};

module.exports = { initialMeals, initialGroups, populateMeals, mealsInDb, nonExistingId };