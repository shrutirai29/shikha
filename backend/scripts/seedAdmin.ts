import dns from "node:dns";

// Force Google DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import connectDatabase from "../src/database/database";
import User from "../src/models/auth/auth.model";

dotenv.config();

const seedAdmin = async (): Promise<void> => {
  try {
    // Connect using your existing database function
    await connectDatabase();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create admin
    const admin = await User.create({
      name: "Admin",
      email: "admin@shikha.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("\n====================================");
    console.log("🎉 Admin created successfully!");
    console.log("====================================");
    console.log(`📧 Email    : ${admin.email}`);
    console.log(`🔑 Password : Admin@123`);
    console.log("====================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin");
    console.error(error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();