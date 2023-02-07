const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./group_test_helpers");
const app = require("../app");
const Group = require("../models/group");

const api = supertest(app);

beforeEach(async () => {
  await Group.deleteMany({});
  await Group.insertMany(helper.initialGroups);
});

describe("when there is initially some groups saved", () => {
  test("groups are returned as json", async () => {
    await api
      .get("/api/groups")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all groups are returned", async () => {
    const res = await api.get("/api/groups");

    expect(res.body).toHaveLength(helper.initialGroups.length);
  });

  test("a specific group is withing the returned groups", async () => {
    const res = await api.get("/api/groups");

    const names = res.body.map(r => r.name);
    expect(names).toContain("Group B");
  });
});

describe("viewing a specific group", () => {
  test("succeeds with a valid id", async () => {
    const groupsAtStart = await helper.groupsInDb();
    const groupToView = groupsAtStart[0];

    const resultGroup = await api
      .get(`/api/groups/${groupToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(resultGroup.body).toEqual(groupToView);
  });

  test("fails with statuscode 404 if group does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId();

    await api
      .get(`/api/groups/${validNonExistingId}`)
      .expect(404);
  });

  test("fails with statuscode 404 if id is invalid", async () => {
    const invalidId = "5a3d5da59070081a82a3445";

    await api
      .get(`/api/notes/${invalidId}`)
      .expect(404);
  });
});

describe("addition of a new group", () => {
  test("succeeds with valid data", async () => {
    const newGroup = {
      name: "New group",
      weeklyRations: 1,
    };

    await api
      .post("/api/groups")
      .send(newGroup)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const groupsAtEnd = await helper.groupsInDb();
    const names = groupsAtEnd.map(g => g.name);

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length + 1);
    expect(names).toContain("New group");
  });

  test("fails with statuscode 400 if name is invalid", async () => {
    const newGroup = {
      weeklyRations: 1,
    };

    await api
      .post("/api/groups")
      .send(newGroup)
      .expect(400);

    const groupsAtEnd = await helper.groupsInDb();

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length);
  });
});

describe("deletion of a group", () => {
  test("succeeds with statuscode 204 if id is valid", async () => {
    const groupsAtStart = await helper.groupsInDb();
    const groupToDelete = groupsAtStart[0];

    await api
      .delete(`/api/groups/${groupToDelete.id}`)
      .expect(204);

    const groupsAtEnd = await helper.groupsInDb();

    expect(groupsAtEnd).toHaveLength(helper.initialGroups.length - 1);

    const names = groupsAtEnd.map(g => g.name);
    expect(names).not.toContain(groupToDelete.name);
  });

  // TODO: Add test for cases when valid id does not exists and
  // for when id is invalid
});

describe("modifying a group", () => {
  test("succeeds with statuscode 204 if id is valid", async () => {
    const groupsAtStart = await helper.groupsInDb();
    const groupToModify = groupsAtStart[0];

    groupToModify.name = "Modified name";

    await api
      .put(`/api/groups/${groupToModify.id}`)
      .send(groupToModify)
      .expect(200);

    const groupsAtEnd = await helper.groupsInDb();
    const names = groupsAtEnd.map(g => g.name);

    expect(names).toContain(groupToModify.name);
  });

  // TODO: Add test for cases when valid id does not exists and
  // for when id is invalid
});

afterAll(() => {
  mongoose.connection.close();
});