const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Meal = require("../models/meal");
const Group = require("../models/group");

const api = supertest(app);

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

beforeEach(async () => {
  await Group.deleteMany({});
  await Meal.deleteMany({});

  const groupObjects = initialGroups.map(g => new Group(g));
  const groupPromiseArray = groupObjects.map(g => g.save());
  await Promise.all(groupPromiseArray);

  const savedGroups = await Group.find({});
  const mealsWithGroupId = [];
  for (const meal of initialMeals) {
    const group = savedGroups.find(g => g.name == meal.group);
    const mealWithGroupId = { ...meal, group: group._id.toString() };
    mealsWithGroupId.push(mealWithGroupId);
  }

  const mealObjects = mealsWithGroupId.map(m => new Meal(m));
  const mealPromiseArray = mealObjects.map(m => m.save());
  await Promise.all(mealPromiseArray);
});

test("meals are returned as json", async () => {
  await api
    .get("/api/meals")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all meals are returned", async () => {
  const res = await api.get("/api/meals");

  expect(res.body).toHaveLength(initialMeals.length);
});

test("a specific meal is within the returned meals", async () => {
  const res = await api.get("/api/meals");

  const names = res.body.map((r) => r.name);
  expect(names).toContain("Pasta con carne y bechamel");
});

afterAll(() => {
  mongoose.connection.close();
});
