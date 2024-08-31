import mongoose from "mongoose";

import app from "./app.js";

import dotenv from "dotenv";

dotenv.config();

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});
