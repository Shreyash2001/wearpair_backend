const { fetchImageData } = require("../services/imageService");
const { processWithLLMsForOccassion } = require("../services/llmService");

const getOccassionDetailsController = async (req, res) => {
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
    const data = await processWithLLMsForOccassion(imageBuffer, url);

    return res.json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = { getOccassionDetailsController };
