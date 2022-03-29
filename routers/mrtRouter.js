const express = require("express");
const router = express.Router();
const { mrtController } = require("../controller");

router.get("/routes", mrtController.getAllRoutes);
router.get("/stations", mrtController.getAllStationsName);

module.exports = router;
