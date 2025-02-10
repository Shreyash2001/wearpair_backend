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
    // const getNamedColor = async (color) => {
    //   const response = await axios.get(
    //     `https://api.color.pizza/v1/?values=${color}`
    //   );
    //   console.log(response);
    // };

    // Process the request with LLMs
    const normalizedData = await processWithLLMs(imageBuffer, url);

    // await addCatalogToData(normalizedData);
    return res.json(normalizedData);
  } catch (error) {
    console.error("Error in getImageDetailsController:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
};

const addCatalogToData = async (normalizedData) => {
  // Function to fetch images and update recommended_types
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

  // Updating all sections
  await updateImages(
    normalizedData.complementary_colors.topwear,
    "Clothing Item",
    normalizedData?.gender
  );
  // await updateImages(normalizedData.complementary_colors.jackets);
  // await updateImages(normalizedData.complementary_colors.bottomwear);
  // await updateImages(normalizedData.accessories.women.handbags);
  // await updateImages(normalizedData.accessories.women.earrings);
  // await updateImages(normalizedData.accessories.women.bracelets);
  // await updateImages(normalizedData.accessories.women.necklaces);
  // await updateImages(normalizedData.accessories.women.footwear);
  // await updateImages(normalizedData.accessories.men.footwear);
  // await updateImages(normalizedData.accessories.men.watches);
  // await updateImages(normalizedData.accessories.men.sunglasses);
  // await updateImages(normalizedData.accessories.men.additional_accessories);
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
