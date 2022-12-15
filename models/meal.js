const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: String,
  group: { type: mongoose.Schema.ObjectId, ref: "Group" },
  timeOfDay: String,
  numberOfDays: Number,
});

mealSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Meal", mealSchema);
