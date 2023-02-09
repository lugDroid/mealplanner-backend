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

describe("when there is initially some meals saved", () => {
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
});

describe("viewing a specific meal", () => {
  test("succeeds with a valid id", async () => {
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

  // TODO: Add test for non existing group
  // TODO: Add test for non valid id 
});

describe("addition of a new meal", () => {
  test("succeeds with valid data", async () => {
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

  test("fails with status code 400 if name is not included", async () => {
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

  test("fails with status code 400 if group is not included", async () => {
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

  test("fails with status code 400 if time of day is not included", async () => {
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

  test("fails with status code 400 if number of days is not included", async () => {
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
});

describe("deletion of a meal", () => {
  test("succeeds with status code 204 if id is valid", async () => {
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

  // TODO: Add test for non existing group
  // TODO: Add test for non valid id 
});

describe("modifying a meal", () => {
  test("succeeds with status code 204 if id is valid", async () => {
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

  // TODO: Add test for non existing group
  // TODO: Add test for non valid id 
});


afterAll(() => {
  mongoose.connection.close();
});
