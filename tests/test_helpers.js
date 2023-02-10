const Group = require("../models/group");
const Meal = require("../models/meal");
const User = require("../models/users");

const initialUsers = [
  {
    username: "root",
    name: "Root User",
    password: "rootuser"
  }
];

const initialGroups = [
  {
    name: "Group A",
    weeklyRations: 6,
  },
  {
    name: "Group B",
    weeklyRations: 4,
  },
];

const initialMeals = [
  {
    name: "Meal A",
    group: "Group A",
    timeOfDay: "Lunch",
    numberOfDays: 2,
  },
  {
    name: "Meal B",
    group: "Group B",
    timeOfDay: "Dinner",
    numberOfDays: 1,
  },
];

const usersInDb = async () => {
  const users = await User.find({});

  return users.map(user => user.toJSON());
};

const nonExistingId = async () => {
  const group = new Group({
    name: "To be removed",
    weeklyRations: 0,
  });

  await group.save();
  await group.remove();

  return group._id.toString();
};

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

const groupsInDb = async () => {
  const groups = await Group.find({});

  return groups.map(group => group.toJSON());
};

module.exports = {
  initialUsers,
  initialMeals,
  initialGroups,
  usersInDb,
  populateMeals,
  mealsInDb,
  nonExistingId,
  groupsInDb
};