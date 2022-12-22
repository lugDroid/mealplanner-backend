const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

test("meals are returned as json", async () => {
  await api
    .get("/api/meals")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there are two notes", async () => {
  const res = await api.get("/api/meals");

  expect(res.body).toHaveLength(2);
});

test("the first meal is a pasta meal", async () => {
  const res = await api.get("/api/meals");

  expect(res.body[0].name).toBe("Pasta con carne y bechamel");
});

afterAll(() => {
  mongoose.connection.close();
});
