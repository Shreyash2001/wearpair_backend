const fetchImageData = async (url) => {
  const imageResp = await fetch(url);
  if (!imageResp.ok) {
    throw new Error(`Failed to fetch image. Status: ${imageResp.status}`);
  }
  return await imageResp.arrayBuffer();
};

module.exports = { fetchImageData };
