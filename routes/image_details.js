const express = require("express");
const {
  getImageDetailsController,
  getOccassionDetailsController,
} = require("../controller/image_details_controller");

const router = express.Router();

router.route("/generate").post(getImageDetailsController);
router.route("/generate/occassion").post(getOccassionDetailsController);

module.exports = router;
