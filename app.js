const express = require("express");
const { dataRouter, mrtRouter } = require("./routers");
//////////////////////////////////
// initialize
//////////////////////////////////
const app = express();
////////////////////////////////////
// Middleware
////////////////////////////////////
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

////////////////////////////////////
// Index Route
////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Welcome to Singapore Mrt Route Finder");
});
//////////////////////////////////////////////////
// Data Routes
//////////////////////////////////////////////////
app.use("/api/data", dataRouter);
//////////////////////////////////////////////////
// Data Routes
//////////////////////////////////////////////////
app.use("/api/mrt", mrtRouter);

module.exports = app;