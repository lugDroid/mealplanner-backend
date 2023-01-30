const group = require("../models/group");
const Group = require("../models/group");

const initialGroups = [
  {
    name: "Group A",
    weeklyRations: 6,
  },
  {
    name: "Group B",
    weeklyRations: 4,
  },
];

const nonExistingId = async () => {
  const group = new group({
    name: "To be removed",
    weeklyRations: 0,
  });

  await group.save();
  await group.remove();

  return group._id.toString();
};

const groupsInDb = async () => {
  const groups = await Group.find({});

  return groups.map(group => group.toJSON());
};

module.exports = { initialGroups, nonExistingId, groupsInDb };