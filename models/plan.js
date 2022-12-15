const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: String,
  lunch: [{ type: mongoose.Schema.ObjectId, ref: "Meal" }],
  dinner: [{ type: mongoose.Schema.ObjectId, ref: "Meal" }],
});

planSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Plan", planSchema);