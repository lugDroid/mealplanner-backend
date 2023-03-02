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

const groupsWithUsersInfo = async (savedUsers) => {
  const groupsWithUsers = [];

  for (const group of initialGroups) {
    // assign random user
    const user = savedUsers[0];
    const groupWithUser = { ...group, user: user.id };
    groupsWithUsers.push(groupWithUser);
  }

  return groupsWithUsers;
};

const mealsWithGroupInfo = async (savedGroups) => {
  const mealsWithGroups = [];

  for (const meal of initialMeals) {
    const group = savedGroups.find(g => g.name == meal.group);

    const mealWithGroup = { ...meal, group: group.id.toString(), user: group.user.id.toString() };
    mealsWithGroups.push(mealWithGroup);
  }

  return mealsWithGroups;
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
  initialGroups,
  initialMeals,
  nonExistingId,
  usersInDb,
  groupsInDb,
  mealsInDb,
  plansInDb,
  groupsWithUsersInfo,
  mealsWithGroupInfo,
  generatePlans,
  getUserToken
};