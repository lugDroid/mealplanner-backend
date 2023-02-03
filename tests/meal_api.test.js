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

test("a valid meal can be added", async () => {
  const newMeal = {
    name: "New meal",
    group: helper.initialGroups[0].name,
    timeOfDay: "Lunch",
    numberOfDays: "1",
  };

  await api
    .post("/api/meals")
    .send(newMeal)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const mealsAtEnd = await helper.mealsInDb();
  const names = mealsAtEnd.map(m => m.name);

  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length + 1);
  expect(names).toContain("New meal");
});

test("a meal without name is not added", async () => {
  const newMeal = {
    group: helper.initialGroups[0].name,
    timeOfDay: "Lunch",
    numberOfDays: "1",
  };

  await api
    .post("/api/meals")
    .send(newMeal)
    .expect(400);

  const mealsAtEnd = await helper.mealsInDb();
  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length);
});

test("a meal without group is not added", async () => {
  const newMeal = {
    name: "New meal",
    timeOfDay: "Lunch",
    numberOfDays: "1",
  };

  await api
    .post("/api/meals")
    .send(newMeal)
    .expect(400);

  const mealsAtEnd = await helper.mealsInDb();
  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length);
});

test("a meal without time of day is not added", async () => {
  const newMeal = {
    name: "New meal",
    group: helper.initialGroups[0].name,
    numberOfDays: "1",
  };

  await api
    .post("/api/meals")
    .send(newMeal)
    .expect(400);

  const mealsAtEnd = await helper.mealsInDb();
  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length);
});

test("a meal without number of days is not added", async () => {
  const newMeal = {
    name: "New meal",
    group: helper.initialGroups[0].name,
    timeOfDay: "Lunch",
  };

  await api
    .post("/api/meals")
    .send(newMeal)
    .expect(400);

  const mealsAtEnd = await helper.mealsInDb();
  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length);
});

afterAll(() => {
  mongoose.connection.close();
});
