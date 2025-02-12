const {
  getImagesApiService,
  getGoogleImages,
} = require("../services/imagesApiService");
const { fetchImageData } = require("../services/imageService");
const {
  processWithLLMs,
  processExtractionWithLLMs,
} = require("../services/llmService");
const { extractImageDetails } = require("../utils/prompts");
const axios = require("axios");

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

    // await addCatalogToData(normalizedData);
    return res.json(normalizedData);
  } catch (error) {
    console.error("Error in getImageDetailsController:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

const getImagesByFilteringController = async (req, res) => {
  try {
    const { gender, category, color, titles } = req.query;
    console.log(req.query);
    if (!category || !gender) {
      return res.status(400).json({ error: "Missing required filters." });
    }
    const titleList = Array.isArray(titles) ? titles : titles.split(",");
    const categoryMap = {
      topwear: "Clothing Item",
      jackets: "Clothing Item",
      bottomwear: "Clothing Item",
      watches: "Accessory",
      sunglasses: "Accessory",
      handbags: "Accessory",
      earrings: "Accessory",
      bracelets: "Accessory",
      necklaces: "Accessory",
      footwear: "Accessory",
      additional_accessories: "Accessory",
    };
    const type = categoryMap[category];
    if (!type) {
      return res.status(400).json({ error: "Invalid category." });
    }

    // Fetch images from Google API
    const imageResults = await Promise.all(
      titleList.map((title) =>
        getGoogleImages({ type, category, gender, color, title })
      )
    );
    const responseData = titleList.map((title, index) => ({
      title,
      images: imageResults[index] || [],
    }));
    return res.json({ category, results: responseData });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Server error" });
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

module.exports = {
  getImageDetailsController,
  extractImageDetailsController,
  getImagesByFilteringController,
};
