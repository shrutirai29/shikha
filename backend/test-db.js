const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://shrutirai2901_db_user:JFwCQTdeq7QW0uFF@shikhadb.fmgnuqh.mongodb.net/shikha?retryWrites=true&w=majority&appName=ShikhaDB";

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