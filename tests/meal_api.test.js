const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helpers");
const app = require("../app");
const Meal = require("../models/meal");
const Group = require("../models/group");
const User = require("../models/users");

const api = supertest(app);
let initialGroups;
let initialMeals;
let token;

beforeAll(async () => {
  await User.deleteMany({});
  await User.insertMany(helper.initialUsers);

  await Group.deleteMany({});
  initialGroups = await helper.generateGroups(5);
  await Group.insertMany(initialGroups);

  initialMeals = await helper.generateMeals(5);

  token = await helper.getUserToken();
});

beforeEach(async () => {
  await Meal.deleteMany({});
  await Meal.insertMany(initialMeals);
});

describe("when there is initially some meals saved", () => {
  test("meals are returned as json", async () => {
    await api
      .get("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all meals are returned", async () => {
    const res = await api
      .get("/api/meals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body).toHaveLength(initialMeals.length);
  });

  test("a specific meal is within the returned meals", async () => {
    const res = await api
      .get("/api/meals")
      .set("Authorization", `Bearer ${token}`);

    const names = res.body.map(meal => meal.name);
    expect(names).toContain(initialMeals[0].name);
  });
});

describe("viewing a specific meal", () => {
  test("succeeds with a valid id", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const mealToView = mealsAtStart[0];

    const resultMeal = await api
      .get(`/api/meals/${mealToView.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultMeal.body.name).toEqual(mealToView.name);
    expect(resultMeal.body.numberOfDays).toEqual(mealToView.numberOfDays);
    expect(resultMeal.body.timeOfDay).toEqual(mealToView.timeOfDay);
  });

  test("fails with status code 404 if meal does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId();

    await api
      .get(`/api/meals/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const invalidId = "nonValidId";

    await api
      .get(`/api/meals/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});

describe("addition of a new meal", () => {
  test("succeeds with valid data", async () => {
    const newMeal = {
      name: "New meal",
      group: initialGroups[0].name,
      timeOfDay: "Lunch",
      numberOfDays: "1",
    };

    await api
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send(newMeal)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const mealsAtEnd = await helper.mealsInDb();
    const names = mealsAtEnd.map(m => m.name);

    expect(mealsAtEnd).toHaveLength(initialMeals.length + 1);
    expect(names).toContain("New meal");
  });

  test("fails with status code 400 if name is not included", async () => {
    const newMeal = {
      group: initialGroups[0].name,
      timeOfDay: "Lunch",
      numberOfDays: "1",
    };

    await api
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send(newMeal)
      .expect(400);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtEnd).toHaveLength(initialMeals.length);
  });

  test("fails with status code 400 if group is not included", async () => {
    const newMeal = {
      name: "New meal",
      timeOfDay: "Lunch",
      numberOfDays: "1",
    };

    await api
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send(newMeal)
      .expect(400);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtEnd).toHaveLength(initialMeals.length);
  });

  test("fails with status code 401 if user authorization is not included", async () => {
    const newMeal = {
      name: "New meal",
      group: initialGroups[0].name,
      timeOfDay: "Lunch",
      numberOfDays: "1",
    };

    await api
      .post("/api/meals")
      .send(newMeal)
      .expect(401);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtEnd).toHaveLength(initialMeals.length);
  });

  test("fails with status code 400 if time of day is not included", async () => {
    const newMeal = {
      name: "New meal",
      group: initialGroups[0].name,
      numberOfDays: "1",
    };

    await api
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send(newMeal)
      .expect(400);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtEnd).toHaveLength(initialMeals.length);
  });

  test("fails with status code 400 if number of days is not included", async () => {
    const newMeal = {
      name: "New meal",
      group: initialGroups[0].name,
      timeOfDay: "Lunch",
    };

    await api
      .post("/api/meals")
      .set("Authorization", `Bearer ${token}`)
      .send(newMeal)
      .expect(400);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtEnd).toHaveLength(initialMeals.length);
  });
});

describe("deletion of a meal", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const mealToDelete = mealsAtStart[0];

    await api
      .delete(`/api/meals/${mealToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const mealsAtEnd = await helper.mealsInDb();

    expect(mealsAtEnd).toHaveLength(initialMeals.length - 1);

    const names = mealsAtEnd.map(m => m.name);
    expect(names).not.toContain(mealToDelete.name);
  });

  test("fails with status code 404 if meal does not exist", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const validNonExistingId = await helper.nonExistingId();

    await api
      .delete(`/api/meals/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtStart).toHaveLength(mealsAtEnd.length);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const invalidId = "nonValidId";

    await api
      .get(`/api/meals/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    const mealsAtEnd = await helper.mealsInDb();
    expect(mealsAtStart).toHaveLength(mealsAtEnd.length);
  });
});

describe("modifying a meal", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const mealToModify = mealsAtStart[0];

    mealToModify.name = "Modified name";

    await api
      .put(`/api/meals/${mealToModify.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(mealToModify)
      .expect(200);

    const mealsAtEnd = await helper.mealsInDb();
    const names = mealsAtEnd.map(m => m.name);

    expect(names).toContain(mealToModify.name);
  });

  test("fails with status code 404 if meal does not exists", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const validNonExistingId = await helper.nonExistingId();
    const mealToModify = mealsAtStart[0];

    mealToModify.name = "Modified name";

    await api
      .put(`/api/meals/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(mealToModify)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const mealsAtStart = await helper.mealsInDb();
    const invalidId = "nonValidId";
    const mealToModify = mealsAtStart[0];

    mealToModify.name = "Modified name";

    await api
      .put(`/api/meals/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(mealToModify)
      .expect(400);
  });
});


afterAll(() => {
  mongoose.connection.close();
});
