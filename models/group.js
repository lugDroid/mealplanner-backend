const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  weeklyRations: { type: Number, required: true },
});

groupSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    if (returnedObject.id) {
      return;
    }

    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Group", groupSchema);
