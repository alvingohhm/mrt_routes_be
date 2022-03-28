const express = require("express");
const router = express.Router();
const { dataController } = require("../controller");

router.get("/create", dataController.generateJsonFile);

module.exports = router;
