/* eslint-disable indent */
require("dotenv").config();

let MONGODB_URI;

switch (process.env.NODE_ENV) {
  case "test":
    MONGODB_URI = process.env.TEST_MONGODB_URI;
    break;
  case "development":
    MONGODB_URI = process.env.DEV_MONGODB_URI;
    break;
  default:
    MONGODB_URI = process.env.MONGODB_URI;
}

/* const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI; */

const PORT = process.env.PORT;

module.exports = {
  MONGODB_URI,
  PORT,
};
