const express = require("express");
const config = require("./config");
//////////////////////////////////
// initialize
//////////////////////////////////
const app = express();
////////////////////////////////////
// Middleware
////////////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//////////////////////////////////
// listening
//////////////////////////////////
app.listen(config.port, () => {
  console.log(`
  ⚡  Using Environment = ${config.env}
  🚀  Server is running
  🔉  Listening on port ${config.port}
`);
});
