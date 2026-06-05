const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { family: 4 });

    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Unable to connect to MongoDB!");
    console.log(err);
  }
};

module.exports = dbConnect;