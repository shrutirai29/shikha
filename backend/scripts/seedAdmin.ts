import dns from "node:dns";
import crypto from "node:crypto";

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
    await connectDatabase();

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists in database.");
      await mongoose.connection.close();
      process.exit(0);
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@knottiingale.com";
    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      crypto.randomBytes(8).toString("hex") + "A1!";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: "Store Administrator",
      email: adminEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      isActive: true,
    });

    console.log("\n====================================");
    console.log("🎉 Admin user created successfully!");
    console.log("====================================");
    console.log(`📧 Email    : ${admin.email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`🔑 One-Time Generated Password: ${adminPassword}`);
      console.log("⚠️ Please save this password securely and change it immediately upon login.");
    } else {
      console.log("🔑 Password configured via ADMIN_PASSWORD environment variable.");
    }
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