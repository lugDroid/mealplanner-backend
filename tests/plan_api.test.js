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
let token;

beforeAll(async () => {
  await User.deleteMany({});
  await User.insertMany(helper.initialUsers);

  await Group.deleteMany({});
  await Group.insertMany(await helper.generateGroups(5));

  await Meal.deleteMany({});
  await Meal.insertMany(await helper.generateMeals(10));

  initialPlans = await helper.generatePlans(2);

  token = await helper.getUserToken();
});

beforeEach(async () => {
  await Plan.deleteMany({});
  await Plan.insertMany(initialPlans);
});

describe("when there is initially some plan saved", () => {
  test("plans are returned as json", async () => {
    await api
      .get("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all plans are returned", async () => {
    const res = await api
      .get("/api/plans")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body).toHaveLength(initialPlans.length);
  });

  test("a specific plan is within the returned plans", async () => {
    const res = await api
      .get("/api/plans")
      .set("Authorization", `Bearer ${token}`);

    const names = res.body.map(plan => plan.name);
    expect(names).toContain(initialPlans[0].name);
  });
});

describe("viewing a specific plan", () => {
  test("succeeds with a valid id", async () => {
    const plansAtStart = await helper.plansInDb();
    const planToView = plansAtStart[0];

    const resultPlan = await api
      .get(`/api/plans/${planToView.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultPlan.body.name).toEqual(planToView.name);
    expect(resultPlan.body.id).toEqual(planToView.id);
  });

  test("fails with status code 404 if plan does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId();

    await api
      .get(`/api/plans/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const invalidId = "nonValidId";

    await api
      .get(`/api/plans/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});

describe("addition of a new plan", () => {
  test("succeeds with valid data", async () => {
    const plansAtStart = await helper.plansInDb();
    const initialPlan = plansAtStart[0];

    const newPlan = {
      name: "New plan",
      lunch: initialPlan.lunch.map(m => m.name),
      dinner: initialPlan.dinner.map(m => m.name),
    };

    await api
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send(newPlan)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length + 1);
    expect(names).toContain(newPlan.name);
  });

  test("fails with status code 400 if name is not included", async () => {
    const plansAtStart = await helper.plansInDb();
    const initialPlan = plansAtStart[0];

    const modifiedPlan = {
      lunch: initialPlan.lunch.map(m => m.name),
      dinner: initialPlan.dinner.map(m => m.name)
    };

    await api
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(400);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
    expect(names).not.toContain(modifiedPlan.name);
  });

  test("fails with status code 401 if user authorizations is not included", async () => {
    const plansAtStart = await helper.plansInDb();
    const initialPlan = plansAtStart[0];

    const modifiedPlan = {
      name: "Modified plan",
      lunch: initialPlan.lunch.map(m => m.name),
      dinner: initialPlan.dinner.map(m => m.name)
    };

    await api
      .post("/api/plans")
      .send(modifiedPlan)
      .expect(401);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
    expect(names).not.toContain(modifiedPlan.name);
  });

  test("fails with status code 400 if lunch meals are not included", async () => {
    const plansAtStart = await helper.plansInDb();
    const initialPlan = plansAtStart[0];

    const modifiedPlan = {
      name: "Modified plan",
      dinner: initialPlan.dinner.map(m => m.name)
    };

    await api
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(400);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
    expect(names).not.toContain(modifiedPlan.name);
  });

  test("fails with status code 400 if dinner meals are not included", async () => {
    const plansAtStart = await helper.plansInDb();
    const initialPlan = plansAtStart[0];

    const modifiedPlan = {
      name: "Modified plan",
      lunch: initialPlan.lunch.map(m => m.name)
    };

    await api
      .post("/api/plans")
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(400);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
    expect(names).not.toContain(modifiedPlan.name);
  });
});

describe("deletion of a plan", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const plansAtStart = await helper.plansInDb();
    const planToDelete = plansAtStart[0];

    await api
      .delete(`/api/plans/${planToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const plansAtEnd = await helper.plansInDb();

    expect(plansAtEnd).toHaveLength(plansAtStart.length - 1);

    const names = plansAtEnd.map(p => p.name);
    expect(names).not.toContain(planToDelete.name);
  });

  test("fails with status code 404 if plan does not exists", async () => {
    const plansAtStart = await helper.plansInDb();
    const validNonExistingId = await helper.nonExistingId();

    await api
      .delete(`/api/plans/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    const plansAtEnd = await helper.plansInDb();

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const plansAtStart = await helper.plansInDb();
    const invalidId = "nonValidId";

    await api
      .delete(`/api/plans/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    const plansAtEnd = await helper.plansInDb();

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
  });
});

describe("modifying a plan", () => {
  test("succeeds with status code 200 if id is valid", async () => {
    const plansAtStart = await helper.plansInDb();
    const planToModify = plansAtStart[0];

    const modifiedPlan = {
      name: "Modified plan",
      lunch: planToModify.lunch.map(m => m.name),
      dinner: planToModify.dinner.map(m => m.name)
    };

    await api
      .put(`/api/plans/${planToModify.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(200);

    const plansAtEnd = await helper.plansInDb();
    const names = plansAtEnd.map(p => p.name);

    expect(plansAtEnd).toHaveLength(plansAtStart.length);
    expect(names).toContain(modifiedPlan.name);
  });

  test("fails with status code 404 if plan does not exist", async () => {
    const plansAtStart = await helper.plansInDb();
    const planToModify = plansAtStart[0];
    const validNonExistingId = await helper.nonExistingId();


    const modifiedPlan = {
      name: "Modified plan",
      lunch: planToModify.lunch.map(m => m.name),
      dinner: planToModify.dinner.map(m => m.name)
    };

    await api
      .put(`/api/plans/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const plansAtStart = await helper.plansInDb();
    const planToModify = plansAtStart[0];
    const invalidId = "nonValidId";


    const modifiedPlan = {
      name: "Modified plan",
      lunch: planToModify.lunch.map(m => m.name),
      dinner: planToModify.dinner.map(m => m.name)
    };

    await api
      .put(`/api/plans/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(modifiedPlan)
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});