import mongoose from "mongoose";

const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  throw new Error("MONGO_URL environment variable is not defined");
}

let connection = {};

const DBconnect = async () => {
 try {
    //using already established connection
    if (connection.isConnected) {
      console.log("Already connected to the database");
      return;
    }
    //try to connect to db if we are not connected
    const db = await mongoose.connect(mongoUrl, {
      dbName: "OpenTask",
      serverSelectionTimeoutMS: 45000,
      socketTimeoutMS: 5000,
    });
    connection.isConnected = db.connections[0].readyState === 1;

    if (connection.isConnected) {
      console.log("MongoDb connected successfully");

      //handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("Mongodb connection error", err);
      });
      mongoose.connection.on("disconnected", () => {
        console.log("Mongodb disconnected");
        connection.isConnected = false;
      });
      //handle graceful shutdown of db server
      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("Mongodb connection closed through app termination");
        process.exit(0);
      });
    }
  } catch (error) {
    console.error("Mongodb connection failed", error.message);
    connection.isConnected = false;
    throw new Error("Failed to connect to MongoDb", error.message);
  }
};

export default DBconnect;