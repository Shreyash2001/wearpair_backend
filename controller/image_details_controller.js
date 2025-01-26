const { GoogleGenerativeAI } = require("@google/generative-ai");

const getImageDetailsController = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'url' in request body." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

    const imageResp = await fetch(url);
    if (!imageResp.ok) {
      throw new Error(`Failed to fetch image. Status: ${imageResp.status}`);
    }

    const imageBuffer = await imageResp.arrayBuffer();

    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(imageBuffer).toString("base64"),
          mimeType: "image/jpeg",
        },
      },
      "1. Identify the clothing item in the image (e.g., shirt, pants, jacket, etc.). 2. Describe the primary color of the clothing item in detail. 3. Suggest complementary colors for shirts, pants, or jackets that would pair well with this clothing item. 4. Provide the suggested colors as HEX codes in a single line, formatted as: Hex Codes for (shirts/pants/jackets): #XXXXXX, #XXXXXX, #XXXXXX. Give all this details in json format",
    ]);

    const aiResponseText = result.response.text();
    console.log("AI response text:", aiResponseText);
    const parsedData = parseToJson(aiResponseText);

    if (!parsedData) {
      return res.status(500).json({ error: "Failed to parse AI response." });
    }

    // Validate the response structure
    if (!isValidResponse(parsedData)) {
      // Send an error response if validation fails
      return res.status(400).json({
        status: "failed",
        error: "Invalid response format. Please retry.",
      });
    }

    // Normalize the data into a fixed JSON structure
    const normalizedData = normalizeLLMResponse(parsedData, url);
    // console.log("Normalized data:", normalizedData);
    return res.json(normalizedData);
  } catch (error) {
    console.error("Error in getImageDetailsController:", error.message);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
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

// Function to normalize LLM response into a fixed JSON structure
const normalizeLLMResponse = (data, url) => {
  // Fixed structure with fallback values
  return {
    clothing_item: data.clothing_item || "",
    primary_color_details: {
      description: data.primary_color || "",
      hex_codes: extractHexCodes(data.primary_color_details) || [],
    },
    complementary_colors: {
      shirts: {
        description: data.complementary_colors?.shirts || "",
        hex_codes: extractHexCodes(data.hex_codes?.shirts) || [],
      },
      jackets: {
        description: data.complementary_colors?.jackets || "",
        hex_codes: extractHexCodes(data.hex_codes?.jackets) || [],
      },
      pants: {
        description: data.complementary_colors?.pants || "",
        hex_codes: extractHexCodes(data.hex_codes?.pants) || [],
      },
    },
    selectedOutfit: url,
    id: "1232", // You can generate dynamic IDs here
  };
};

// Extract hex codes from a text string
const extractHexCodes = (text) => {
  if (!text || typeof text !== "string") return [];
  const hexCodePattern = /#[A-Fa-f0-9]{6}/g;
  return text.match(hexCodePattern) || [];
};

const isValidResponse = (data) => {
  // Ensure the parsed data is an object and contains the required fields
  return (
    data &&
    typeof data === "object" &&
    data.clothing_item &&
    data.primary_color &&
    data.complementary_colors &&
    (data.complementary_colors.shirts || data.complementary_colors.jackets) &&
    data.hex_codes
  );
};

module.exports = { getImageDetailsController };
