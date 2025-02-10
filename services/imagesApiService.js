const axios = require("axios");

const getGoogleImages = async (query) => {
  const color = getNamedColor(query?.color);
  const clothingString = `${query?.type}: ${query?.title}, Gender: ${query?.gender}, Color: ${query?.color}`;
  const API_KEY = process.env.GOOGLE_IMAGE_SEARCH_API_KEY; // Replace with your API Key
  const CX = process.env.GOOGLE_SEARCH_ENGINE_KEY; // Replace with your Search Engine ID
  console.log(clothingString);
  const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${"Clothing Item: Shirts, Gender: Women, Color: white"}&cx=${CX}&searchType=image&key=${API_KEY}`;

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
  const response = await axios.get(
    `https://api.color.pizza/v1/?values=${color}`
  );
  console.log(response);
};

module.exports = { getGoogleImages };
