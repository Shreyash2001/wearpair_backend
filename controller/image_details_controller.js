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
    const { gender, category, color, title } = req.query;
    console.log(req.query);
    if (!category || !gender) {
      return res.status(400).json({ error: "Missing required filters." });
    }
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
    const query = { type, category, gender, color, title };
    const images = await getGoogleImages(query);
    return res.json({ category, images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const addCatalogToData = async (normalizedData) => {
  const updateImages = async (section, type, gender) => {
    if (!section || !section.recommended_types) return;

    await Promise.all(
      section.recommended_types.map(async (item) => {
        const query = {
          type: type,
          title: item.title,
          color: section?.hex_codes[0],
          gender: gender,
        };
        const images = await getGoogleImages(query);
        console.log(images);
        item.image = images.length > 0 ? images[0] : "";
      })
    );
  };

  await updateImages(
    normalizedData.complementary_colors.topwear,
    "Clothing Item",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.complementary_colors.jackets,
    "Clothing Item",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.complementary_colors.bottomwear,
    "Clothing Item",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.women.handbags,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.women.earrings,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.women.bracelets,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.women.necklaces,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.women.footwear,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.men.footwear,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.men.watches,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.men.sunglasses,
    "Accessory",
    normalizedData?.gender
  );
  await updateImages(
    normalizedData.accessories.men.additional_accessories,
    "Accessory",
    normalizedData?.gender
  );
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
