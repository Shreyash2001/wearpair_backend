const { fetchImageData } = require("../services/imageService");
const {
  processWithLLMs,
  processExtractionWithLLMs,
} = require("../services/llmService");
const { extractImageDetails } = require("../utils/prompts");

const getImageDetailsController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'url' in request body." });
    }

    // Fetch image data
    const imageBuffer = await fetchImageData(url);

    // Process the request with LLMs
    const normalizedData = await processWithLLMs(imageBuffer, url);

    return res.json(normalizedData);
  } catch (error) {
    console.error("Error in getImageDetailsController:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

const extractImageDetailsController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'url' in request body." });
    }
    const imageBuffer = await fetchImageData(url);
    const data = await processExtractionWithLLMs(imageBuffer, url);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getImageDetailsController:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

module.exports = { getImageDetailsController, extractImageDetailsController };
