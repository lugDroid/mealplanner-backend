const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./meal_test_helpers");
const app = require("../app");
const Meal = require("../models/meal");
const Group = require("../models/group");

const api = supertest(app);

beforeEach(async () => {
  await Group.deleteMany({});
  await Group.insertMany(helper.initialGroups);

  await Meal.deleteMany({});
  const savedGroups = await Group.find({});
  const populatedMeals = await helper.populateMeals(savedGroups);
  await Meal.insertMany(populatedMeals);
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

test("a specific meal can be viewed", async () => {
  const mealsAtStart = await helper.mealsInDb();
  const mealToView = mealsAtStart[0];

  const resultMeal = await api
    .get(`/api/meals/${mealToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(resultMeal.body.name).toEqual(mealToView.name);
  expect(resultMeal.body.numberOfDays).toEqual(mealToView.numberOfDays);
  expect(resultMeal.body.timeOfDay).toEqual(mealToView.timeOfDay);
});

test("a meal can be deleted", async () => {
  const mealsAtStart = await helper.mealsInDb();
  const mealToDelete = mealsAtStart[0];

  await api
    .delete(`/api/meals/${mealToDelete.id}`)
    .expect(204);

  const mealsAtEnd = await helper.mealsInDb();

  expect(mealsAtEnd).toHaveLength(helper.initialMeals.length - 1);

  const names = mealsAtEnd.map(m => m.name);
  expect(names).not.toContain(mealToDelete.name);
});

test("a meal name can be modified", async () => {
  const mealsAtStart = await helper.mealsInDb();
  const mealToModify = mealsAtStart[0];

  mealToModify.name = "Modified name";

  await api
    .put(`/api/meals/${mealToModify.id}`)
    .send(mealToModify)
    .expect(200);

  const mealsAtEnd = await helper.mealsInDb();
  const names = mealsAtEnd.map(m => m.name);

  expect(names).toContain(mealToModify.name);
});

afterAll(() => {
  mongoose.connection.close();
});
