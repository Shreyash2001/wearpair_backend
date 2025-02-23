const axios = require("axios");

const getGoogleImages = async (query) => {
  console.log(query);
  const color = await getNamedColor(query?.color);
  const clothingString = `${query?.title} ${query?.gender} ${color}`;
  const API_KEY = process.env.GOOGLE_IMAGE_SEARCH_API_KEY; // Replace with your API Key
  const CX = process.env.GOOGLE_SEARCH_ENGINE_KEY; // Replace with your Search Engine ID
  console.log(clothingString);
  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${clothingString}&cx=${CX}&searchType=image&key=${API_KEY}&cr=countryIN`;
  console.log(searchUrl);
  try {
    const response = await axios.get(searchUrl);
    const images = response.data.items.map((item) => item.link); // Extract image URLs
    console.log(images);
    return images;
  } catch (error) {
    console.error(
      "Error fetching images:",
      error.response?.data || error.message
    );
    return [];
  }
};

const getNamedColor = async (color) => {
  const cleanedColor = color.replace("#", "");
  const response = await axios.get(
    `https://api.color.pizza/v1/?values=${cleanedColor}`
  );
  const data = response.data;
  return data.colors[0].name;
};

module.exports = { getGoogleImages };
