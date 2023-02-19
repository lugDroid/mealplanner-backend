const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  timeOfDay: String,
  numberOfDays: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

mealSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject.id) {
      return;
    }

    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Meal", mealSchema);
