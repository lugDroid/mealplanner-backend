const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helpers");
const app = require("../app");
const Group = require("../models/group");
const User = require("../models/users");

const api = supertest(app);
let initialGroups;

beforeAll(async () => {
  await User.deleteMany({});
  await User.insertMany(helper.initialUsers);

  initialGroups = await helper.generateGroups(5);
});

beforeEach(async () => {
  await Group.deleteMany({});
  await Group.insertMany(initialGroups);
});

describe("when there is initially some groups saved", () => {
  test("groups are returned as json", async () => {
    const token = await helper.getUserToken();

    await api
      .get("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all groups are returned", async () => {
    const token = await helper.getUserToken();
    const res = await api
      .get("/api/groups")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body).toHaveLength(helper.initialGroups.length);
  });

  test("a specific group is withing the returned groups", async () => {
    const token = await helper.getUserToken();
    const res = await api
      .get("/api/groups")
      .set("Authorization", `Bearer ${token}`);

    const names = res.body.map(r => r.name);
    expect(names).toContain(helper.initialGroups[0].name);
  });
});

describe("viewing a specific group", () => {
  test("succeeds with a valid id", async () => {
    const token = await helper.getUserToken();
    const groupsAtStart = await await helper.groupsInDb();
    const groupToView = groupsAtStart[0];

    const resultGroup = await api
      .get(`/api/groups/${groupToView.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultGroup.body).toEqual(groupToView);
  });

  test("fails with statuscode 404 if group does not exist", async () => {
    const token = await helper.getUserToken();
    const validNonExistingId = await helper.nonExistingId();

    await api
      .get(`/api/groups/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("fails with statuscode 400 if id is invalid", async () => {
    const token = await helper.getUserToken();
    const invalidId = "nonValidId";

    await api
      .get(`/api/groups/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});

describe("addition of a new group", () => {
  test("succeeds with valid data", async () => {
    const token = await helper.getUserToken();

    const newGroup = {
      name: "New group",
      weeklyRations: 1,
    };

    await api
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(newGroup)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const groupsAtEnd = await helper.groupsInDb();
    const names = groupsAtEnd.map(g => g.name);

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length + 1);
    expect(names).toContain("New group");
  });

  test("fails with status code 400 if name is missing", async () => {
    const token = await helper.getUserToken();

    const newGroup = {
      weeklyRations: 1,
    };

    await api
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(newGroup)
      .expect(400);

    const groupsAtEnd = await helper.groupsInDb();

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length);
  });

  test("fails with status code 401 if user authorization is missing", async () => {
    const newGroup = {
      name: "Test Group",
      weeklyRations: 1
    };

    await api
      .post("/api/groups")
      //.set("Authorization", `Bearer ${token}`)
      .send(newGroup)
      .expect(401);

    const groupsAtEnd = await helper.groupsInDb();

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length);
  });
});

describe("deletion of a group", () => {
  test("succeeds with status code 204 if id is valid", async () => {
    const token = await helper.getUserToken();
    const groupsAtStart = await helper.groupsInDb();
    const groupToDelete = groupsAtStart[0];

    await api
      .delete(`/api/groups/${groupToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const groupsAtEnd = await helper.groupsInDb();

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length - 1);

    const names = groupsAtEnd.map(g => g.name);
    expect(names).not.toContain(groupToDelete.name);
  });

  test("fails with status code 404 if group does not exist", async () => {
    const token = await helper.getUserToken();
    const validNonExistingId = await helper.nonExistingId();

    await api
      .delete(`/api/groups/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const token = await helper.getUserToken();
    const invalidId = "nonValidId";

    await api
      .delete(`/api/groups/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });
});

describe("modifying a group", () => {
  test("succeeds with statuscode 204 if id is valid", async () => {
    const token = await helper.getUserToken();
    const groupsAtStart = await helper.groupsInDb();
    const groupToModify = groupsAtStart[0];

    groupToModify.name = "Modified name";

    await api
      .put(`/api/groups/${groupToModify.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(groupToModify)
      .expect(200);

    const groupsAtEnd = await helper.groupsInDb();
    const names = groupsAtEnd.map(g => g.name);

    expect(names).toContain(groupToModify.name);
  });

  test("fails with status code 404 if group does not exist", async () => {
    const token = await helper.getUserToken();
    const groupsAtStart = await helper.groupsInDb();
    const groupToModify = groupsAtStart[0];
    const validNonExistingId = await helper.nonExistingId();

    groupToModify.name = "Modified name";

    await api
      .put(`/api/groups/${validNonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(groupToModify)
      .expect(404);

    const groupsAtEnd = await helper.groupsInDb();
    expect(groupsAtStart).toHaveLength(groupsAtEnd.length);
  });

  test("fails with status code 400 if id is invalid", async () => {
    const token = await helper.getUserToken();
    const groupsAtStart = await helper.groupsInDb();
    const groupToModify = groupsAtStart[0];
    const invalidId = "nonValidId";

    groupToModify.name = "Modified name";

    await api
      .put(`/api/groups/${invalidId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(groupToModify)
      .expect(400);

    const groupsAtEnd = await helper.groupsInDb();
    expect(groupsAtStart).toHaveLength(groupsAtEnd.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});