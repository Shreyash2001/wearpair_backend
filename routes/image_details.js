const express = require("express");
const {
  getImageDetailsController,
  extractImageDetailsController,
} = require("../controller/image_details_controller");
const {
  getOccassionDetailsController,
} = require("../controller/occassion_details_controller");

const router = express.Router();

router.route("/generate").post(getImageDetailsController);
router.route("/generate/occassion").post(getOccassionDetailsController);
router.route("/extract-details").post(extractImageDetailsController);

module.exports = router;
