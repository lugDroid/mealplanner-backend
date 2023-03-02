const Group = require("../models/group");
const Meal = require("../models/meal");
const plan = require("../models/plan");
const User = require("../models/users");
const jwt = require("jsonwebtoken");

const initialUsers = [
  {
    username: "root",
    name: "Root User",
    password: "rootuser"
  }
];

const nonExistingId = async () => {
  const user = await usersInDb();
  const group = new Group({
    name: "To be removed",
    weeklyRations: 0,
    user: user[0].id
  });

  await group.save();
  await group.remove();

  return group._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});

  return users.map(user => user.toJSON());
};

const groupsInDb = async () => {
  let groups = await Group.find({}).populate("user", { username: 1, name: 1 });

  return groups.map(group => group.toJSON());
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

const plansInDb = async () => {
  const plans = await plan.find({})
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

  return plans.map(plan => plan.toJSON());
};

const generateGroups = async (numberOfGroups) => {
  const groups = [];
  const users = await usersInDb();

  for (let i = 0; i < numberOfGroups; i++) {
    const group = {
      name: "Group " + i,
      weeklyRations: Math.floor(Math.random() * 4),
      user: users[0].id
    };

    groups.push(group);
  }

  return groups;
};

const generateMeals = async (numberOfMeals) => {
  const meals = [];
  const times = ["Lunch", "Dinner", "Any"];
  const users = await usersInDb();
  const groups = await groupsInDb();

  for (let i = 0; i < numberOfMeals; i++) {
    const meal = {
      name: "Meal " + i,
      group: groups[Math.floor(Math.random() * groups.length)].id,
      timeOfDay: times[Math.floor(Math.random() * times.length)],
      numberOfDays: Math.floor(Math.random() * 2),
      user: users[Math.floor(Math.random() * users.length)].id
    };

    meals.push(meal);
  }
  return meals;
};

const generatePlans = async (numberOfPlans) => {
  const plans = [];
  const meals = await mealsInDb();
  const users = await usersInDb();

  for (let i = 0; i < numberOfPlans; i++) {
    const initialData = {
      name: "Test Plan",
      lunch: [],
      dinner: [],
    };

    initialData.name = `${initialData.name} ${i}`;

    for (let j = 0; j < 7; j++) {
      initialData.lunch.push(meals[Math.floor(Math.random() * meals.length)].id);
      initialData.dinner.push(meals[Math.floor(Math.random() * meals.length)].id);
    }

    initialData.user = users[Math.floor(Math.random() * users.length)].id;

    plans.push(initialData);
  }

  return plans;
};

const getUserToken = async () => {
  const users = await usersInDb();
  const user = users[0];
  return jwt.sign(user, process.env.SECRET);
};

module.exports = {
  initialUsers,
  nonExistingId,
  usersInDb,
  groupsInDb,
  mealsInDb,
  plansInDb,
  generateGroups,
  generateMeals,
  generatePlans,
  getUserToken
};