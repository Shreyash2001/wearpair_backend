const express = require("express");
const {
  getImageDetailsController,
} = require("../controller/image_details_controller");

const router = express.Router();

router.route("/generate").post(getImageDetailsController);

module.exports = router;
