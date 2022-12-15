const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: String,
  weeklyRations: Number,
});

groupSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Group", groupSchema);
