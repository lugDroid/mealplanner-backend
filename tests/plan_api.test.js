const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helpers");
const app = require("../app");
const Group = require("../models/group");
const Meal = require("../models/meal");
const User = require("../models/users");
const Plan = require("../models/plan");

const api = supertest(app);
let initialPlans;

beforeAll(async () => {
  initialPlans = await helper.generatePlans(2);
});

beforeEach(async () => {
  await User.deleteMany({});
  await User.insertMany(helper.initialUsers);

  await Group.deleteMany({});
  const savedUsers = await helper.usersInDb();
  const groupsToAdd = await helper.groupsWithUsersInfo(savedUsers);
  await Group.insertMany(groupsToAdd);

  await Meal.deleteMany({});
  const savedGroups = await helper.groupsInDb();
  const mealsToAdd = await helper.mealsWithGroupInfo(savedGroups);
  await Meal.insertMany(mealsToAdd);

  await Plan.deleteMany({});
  await Plan.insertMany(initialPlans);
});

describe("when there is initially some plan saved", () => {
  test("plans are returned as json", async () => {
    await api
      .get("/api/plans")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all plans are returned", async () => {
    const res = await api.get("/api/plans");

    expect(res.body).toHaveLength(initialPlans.length);
  });

  test("a specific plan is within the returned plans", async () => {
    const res = await api.get("/api/plans");

    const names = res.body.map(plan => plan.name);
    expect(names).toContain(initialPlans[0].name);
  });
});

afterAll(() => {
  mongoose.connection.close();
});