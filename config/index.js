const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";

//set different dotenv path base on which node environment
if (env === "development") {
  dotenv.config({ path: "config/.env.development" });
}

const baseConfig = {
  env,
  port: process.env.PORT,
};

module.exports = baseConfig;
