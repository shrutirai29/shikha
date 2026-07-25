import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    const connection = await mongoose.connect(mongoUri);

    console.log("====================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Database : ${connection.connection.name}`);
    console.log(`🖥️ Host     : ${connection.connection.host}`);
    console.log("====================================");
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed");

    console.dir(error, {
      depth: null,
      colors: true,
    });

    if (error?.reason?.servers) {
      for (const [host, server] of error.reason.servers) {
        console.log("\n============================");
        console.log(host);
        console.dir(server.error, {
          depth: null,
          colors: true,
        });
      }
    }

    process.exit(1);
  }
};

export default connectDatabase;