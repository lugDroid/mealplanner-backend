const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  lunch: [{ type: mongoose.Schema.ObjectId, ref: "Meal" }],
  dinner: [{ type: mongoose.Schema.ObjectId, ref: "Meal" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

planSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject.id) {
      return;
    }

    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Plan", planSchema);
