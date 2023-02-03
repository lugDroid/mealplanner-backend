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

module.exports = { initialMeals, initialGroups, populateMeals };