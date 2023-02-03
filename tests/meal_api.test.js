const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./meal_test_helpers");
const app = require("../app");
const Meal = require("../models/meal");
const Group = require("../models/group");

const api = supertest(app);

beforeEach(async () => {
  await Group.deleteMany({});
  await Meal.deleteMany({});

  const groupObjects = helper.initialGroups.map(g => new Group(g));
  const groupPromiseArray = groupObjects.map(g => g.save());
  await Promise.all(groupPromiseArray);

  const savedGroups = await Group.find({});
  const populatedMeals = await helper.populateMeals(savedGroups);
  const mealObjects = populatedMeals.map(m => new Meal(m));
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

  expect(res.body).toHaveLength(helper.initialMeals.length);
});

test("a specific meal is within the returned meals", async () => {
  const res = await api.get("/api/meals");

  const names = res.body.map((r) => r.name);
  expect(names).toContain("Pasta con carne y bechamel");
});

afterAll(() => {
  mongoose.connection.close();
});
