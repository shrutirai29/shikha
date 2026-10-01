import dotenv from "dotenv";
dotenv.config();

import connectDatabase from "../src/database/database";
import { submitToIndexNow, generateSitemapXml } from "../src/services/seo/seo.service";
import mongoose from "mongoose";

const run = async () => {
  console.log("==========================================");
  console.log("⚡ IndexNow Search Engine Submission");
  console.log("==========================================");

  try {
    await connectDatabase();
    console.log("Connected to MongoDB. Extracting URLs from dynamic sitemap...");

    const xml = await generateSitemapXml();
    const locMatches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    console.log(`Discovered ${locMatches.length} URLs to submit.`);

    const result = await submitToIndexNow(locMatches);

    console.log("==========================================");
    console.log(`Status  : ${result.status}`);
    console.log(`Result  : ${result.message}`);
    console.log("==========================================");

    await mongoose.connection.close();
    process.exit(result.success ? 0 : 1);
  } catch (err: any) {
    console.error("IndexNow submission failed:", err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
