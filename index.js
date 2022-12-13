const express = require("express");
const app = express();

app.use(express.json());

let meals = [
  {
    name: "Tortilla de patatas",
    group: "Tortillas/Revueltos",
    timeOfDay: "Dinner",
    numberOfDays: 1,
    id: 1,
  },
  {
    id: 2,
    name: "Pruebe con huevos fritos",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 3,
    name: "Hamburguesas con patatas alioli",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 4,
    name: "Dorada con verdura",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Pescado",
  },
  {
    id: 5,
    name: "Fajitas tortillas",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Tortillas/Revueltos",
  },
  {
    id: 6,
    name: "Tortilla de calabacin",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Tortillas/Revueltos",
  },
  {
    id: 7,
    name: "Revuelto de setas",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Tortillas/Revueltos",
  },
  {
    id: 8,
    name: "Bocadillos de lomo con queso",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 9,
    name: "Tortilla de atun",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Tortillas/Revueltos",
  },
  {
    id: 10,
    name: "Ensalada sardinas con tomate",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Pescado",
  },
  {
    id: 11,
    name: "Revuelto de esparragos",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Tortillas/Revueltos",
  },
  {
    id: 12,
    name: "Pure calabacin y brocoli con pescado a la plancha",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Pescado",
  },
  {
    id: 13,
    name: "Huevos a la plancha con pure de patatas",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Legumbres/Verduras",
  },
  {
    id: 14,
    name: "Trucha con verdura",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Pescado",
  },
  {
    id: 15,
    name: "Filetes de pollo con pure de patatas",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 16,
    name: "Salchichas con pimientos",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 17,
    name: "Filetes de lomo con brocoli",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 18,
    name: "Tajine",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Carne",
  },
  {
    id: 19,
    name: "Fajitas de pollo",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Carne",
  },
  {
    id: 20,
    name: "Carne con tomate + ensalada",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Carne",
  },
  {
    id: 21,
    name: "Lenguado con verdura",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Dinner",
    group: "Pescado",
  },
  {
    id: 22,
    name: "Arroz con wok y lomo",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 23,
    name: "Solomillo con patatas",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Lunch",
    group: "Carne",
  },
  {
    name: "Pasta con carne y bechamel",
    group: "Pasta",
    timeOfDay: "Lunch",
    numberOfDays: 2,
    id: 24,
  },
  {
    id: 25,
    name: "Crema de verduras + huevos rellenos + ensalada",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Legumbres/Verduras",
  },
  {
    id: 26,
    name: "Ensaladilla rusa",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 27,
    name: "Arroz con pollo",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    name: "Pasta con huevo y verduras",
    group: "Pasta",
    timeOfDay: "Lunch",
    numberOfDays: 2,
    id: 28,
  },
  {
    id: 29,
    name: "Lentejas",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 30,
    name: "Patatas con carne",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 31,
    name: "Paella",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 32,
    name: "Cous-Cous",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 33,
    name: "Cocido",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 34,
    name: "Arroz con wok asiatico",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 35,
    name: "Patatas frias",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    id: 36,
    name: "Arroz con verduras",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
  {
    name: "Pasta con atun y verduras",
    group: "Pasta",
    timeOfDay: "Lunch",
    numberOfDays: 2,
    id: 37,
  },
  {
    id: 38,
    name: "Carne con tomate + huevos rellenos",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Carne",
  },
  {
    id: 39,
    name: "Sopa fideos + filetes",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Lunch",
    group: "Carne",
  },
  {
    id: 40,
    name: "Pure alcachofa + pescado",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Pescado",
  },
  {
    id: 41,
    name: "Crema verduras + empanada",
    description: " ",
    numberOfDays: 1,
    timeOfDay: "Any",
    group: "Legumbres/Verduras",
  },
  {
    id: 42,
    name: "Wok de garbanzos",
    description: " ",
    numberOfDays: 2,
    timeOfDay: "Lunch",
    group: "Legumbres/Verduras",
  },
];

let groups = [
  {
    name: "Carne",
    weeklyRations: "4",
    id: 1,
  },
  {
    name: "Legumbres/Verduras",
    weeklyRations: 6,
    id: 2,
  },
  {
    name: "Tortillas/Revueltos",
    weeklyRations: 6,
    id: 3,
  },
  {
    name: "Pescado",
    weeklyRations: "2",
    id: 4,
  },
  {
    name: "Pasta",
    weeklyRations: "4",
    id: 5,
  },
];

let plans = [
  {
    name: "Semana 1",
    lunch: [
      {
        id: 33,
        name: "Cocido",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 33,
        name: "Cocido",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 12,
        name: "Pure calabacin y brocoli con pescado a la plancha",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Pescado",
      },
      {
        id: 32,
        name: "Cous-Cous",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 32,
        name: "Cous-Cous",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 38,
        name: "Carne con tomate + huevos rellenos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Carne",
      },
      {
        name: "Pasta con atun y verduras",
        group: "Pasta",
        timeOfDay: "Lunch",
        numberOfDays: 2,
        id: 37,
      },
    ],
    dinner: [
      {
        id: 7,
        name: "Revuelto de setas",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Tortillas/Revueltos",
      },
      {
        id: 25,
        name: "Crema de verduras + huevos rellenos + ensalada",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Legumbres/Verduras",
      },
      {
        id: 38,
        name: "Carne con tomate + huevos rellenos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Carne",
      },
      {
        id: 16,
        name: "Salchichas con pimientos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Carne",
      },
      {
        id: 17,
        name: "Filetes de lomo con brocoli",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Carne",
      },
      {
        id: 40,
        name: "Pure alcachofa + pescado",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Pescado",
      },
      {
        id: 11,
        name: "Revuelto de esparragos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Tortillas/Revueltos",
      },
    ],
    id: 1,
  },
  {
    name: "Semana 2",
    lunch: [
      {
        id: 22,
        name: "Arroz con wok y lomo",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 22,
        name: "Arroz con wok y lomo",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 39,
        name: "Sopa fideos + filetes",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Lunch",
        group: "Carne",
      },
      {
        id: 31,
        name: "Paella",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 31,
        name: "Paella",
        description: " ",
        numberOfDays: 2,
        timeOfDay: "Lunch",
        group: "Legumbres/Verduras",
      },
      {
        id: 38,
        name: "Carne con tomate + huevos rellenos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Carne",
      },
      {
        id: 25,
        name: "Crema de verduras + huevos rellenos + ensalada",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Legumbres/Verduras",
      },
    ],
    dinner: [
      {
        id: 10,
        name: "Ensalada sardinas con tomate",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Pescado",
      },
      {
        id: 9,
        name: "Tortilla de atun",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Tortillas/Revueltos",
      },
      {
        id: 6,
        name: "Tortilla de calabacin",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Tortillas/Revueltos",
      },
      {
        id: 3,
        name: "Hamburguesas con patatas alioli",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Carne",
      },
      {
        id: 11,
        name: "Revuelto de esparragos",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Tortillas/Revueltos",
      },
      {
        id: 41,
        name: "Crema verduras + empanada",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Any",
        group: "Legumbres/Verduras",
      },
      {
        id: 18,
        name: "Tajine",
        description: " ",
        numberOfDays: 1,
        timeOfDay: "Dinner",
        group: "Carne",
      },
    ],
    id: 2,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Meal Planner App</h1>");
});

app.get("/api/meals", (req, res) => {
  res.json(meals);
});

app.get("/api/meals/:id", (req, res) => {
  const id = Number(req.params.id);
  const meal = meals.find((m) => m.id === id);

  if (meal) {
    res.json(meal);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/meals/:id", (req, res) => {
  const id = Number(req.params.id);
  meals = meals.filter((m) => m.id !== id);

  res.status(204).end();
});

app.post("/api/meals", (req, res) => {
  const newMeal = req.body;
  newMeal.id = Math.max(...meals.map((m) => m.id)) + 1;

  meals = meals.concat(newMeal);

  res.json(newMeal);
});

app.get("/api/groups", (req, res) => {
  res.json(groups);
});

app.get("/api/groups/:id", (req, res) => {
  const id = Number(req.params.id);
  const group = groups.find((g) => g.id === id);

  if (group) {
    res.json(group);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/groups/:id", (req, res) => {
  const id = Number(req.params.id);
  groups = groups.filter((g) => g.id !== id);

  res.status(204).end();
});

app.post("/api/groups", (req, res) => {
  const newGroup = req.body;
  newGroup.id = Math.max(...groups.map((m) => m.id)) + 1;

  groups = groups.concat(newGroup);

  res.json(newGroup);
});

app.get("/api/plans", (req, res) => {
  res.json(plans);
});

app.get("/api/plans/:id", (req, res) => {
  const id = Number(req.params.id);
  const plan = plans.find((p) => p.id === id);

  if (plan) {
    res.json(plan);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/plans/:id", (req, res) => {
  const id = Number(req.params.id);
  plans = plans.filter((p) => p.id !== id);

  res.status(204).end();
});

app.post("/api/plans", (req, res) => {
  const newPlan = req.body;
  newPlan.id = Math.max(...plans.map((m) => m.id)) + 1;

  plans = plans.concat(newPlan);

  res.json(newPlan);
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
