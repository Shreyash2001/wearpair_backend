const { GoogleGenerativeAI } = require("@google/generative-ai");

const getImageDetailsController = async (req, res) => {
  // Access your API key as an environment variable (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
  const { url } = req.body;
  const imageResp = await fetch(url).then((response) => response.arrayBuffer());

  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageResp).toString("base64"),
        mimeType: "image/jpeg",
      },
    },

    "1. Identify the clothing item in the image (e.g., shirt, pants, jacket, etc.). 2. Describe the primary color of the clothing item in detail. 3. Suggest complementary colors for shirts, pants, or jackets that would pair well with this clothing item. 4. Provide the suggested colors as HEX codes in a single line, formatted as: Hex Codes for (Shirts/Pants/Jackets): #XXXXXX, #XXXXXX, #XXXXXX. Give all this details in json format",
  ]);
  const parsedData = parseToJson(result.response.text());
  console.log(parsedData);
  return res.json(parsedData);
};

const parseToJson = (inputString) => {
  try {
    // Remove Markdown formatting markers (` ```json` and ` ``` `)
    const cleanedString = inputString.replace(/```json|```/g, "").trim();
    // Parse the cleaned string as JSON
    const parsedJson = JSON.parse(cleanedString);
    return parsedJson;
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return null;
  }
};

module.exports = { getImageDetailsController };
