const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Group = require("../models/group");

const api = supertest(app);

const initialGroups = [
  {
    name: "Tortillas/Revueltos",
    weeklyRations: 6,
  },
  {
    name: "Pasta",
    weeklyRations: 4,
  },
];

beforeEach(async () => {
  await Group.deleteMany({});

  for (const group of initialGroups) {
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

  expect(res.body).toHaveLength(initialGroups.length);
});

test("a specific group is withing the returned groups", async () => {
  const res = await api.get("/api/groups");

  const names = res.body.map((r) => r.name);
  expect(names).toContain("Pasta");
})

afterAll(() => {
  mongoose.connection.close();
});