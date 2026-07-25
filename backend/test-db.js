const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected");
    process.exit(0);
  })
  .catch((err) => {
    console.log("========== FULL ERROR ==========");
    console.dir(err, { depth: null });
    console.log("================================");
    process.exit(1);
  });
