import dns from "node:dns";

// Force Google DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import { validateEnv } from "./config/env";
validateEnv();

import app from "./app";
import connectDatabase from "./database/database";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log("====================================");
      console.log("🚀 Shikha Backend Started");
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`🌎 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();
