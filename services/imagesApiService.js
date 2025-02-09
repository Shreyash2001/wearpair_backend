const axios = require("axios");
const getImagesApiService = async (query) => {
  const payload = {
    query: query,
    type: "text_search",
    page: 1,
    offset: 0,
    limit: 1,
    cursor: null,
    isDevicePhone: false,
  };
  try {
    const response = await axios.post(
      "https://www.meesho.com/api/v1/products/search",
      payload
    );
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = { getImagesApiService };
