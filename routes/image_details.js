const express = require("express");
const {
  getImageDetailsController,
} = require("../controller/image_details_controller");

const router = express.Router();

router.route("/generate").get(getImageDetailsController);

module.exports = router;
