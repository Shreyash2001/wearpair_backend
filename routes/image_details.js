const express = require("express");
const {
  getImageDetailsController,
} = require("../controller/image_details_controller");
const {
  getOccassionDetailsController,
} = require("../controller/occassion_details_controller");

const router = express.Router();

router.route("/generate").post(getImageDetailsController);
router.route("/generate/occassion").post(getOccassionDetailsController);

module.exports = router;
