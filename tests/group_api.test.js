const { application } = require("express");
const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./group_test_helpers");
const app = require("../app");
const Group = require("../models/group");

const api = supertest(app);

beforeEach(async () => {
  await Group.deleteMany({});

  for (const group of helper.initialGroups) {
    await new Group(group).save();
  }
});

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

test("a valid group can be added", async () => {
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

test("a group without name is not added", async () => {
  const newGroup = {
    weeklyRations: 1,
  };

  await api
    .post("/api/groups")
    .send(newGroup)
    .expect(400);

  const groupsAtEnd = await helper.groupsInDb();

  expect(groupsAtEnd).toHaveLength(helper.initialGroups.length);
})

afterAll(() => {
  mongoose.connection.close();
});