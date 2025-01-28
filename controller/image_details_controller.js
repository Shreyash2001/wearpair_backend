const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Mistral } = require("@mistralai/mistralai");
const { cloth_details_prompt } = require("../utils/prompts");

const fetchImageData = async (url) => {
  const imageResp = await fetch(url);
  if (!imageResp.ok) {
    throw new Error(`Failed to fetch image. Status: ${imageResp.status}`);
  }
  return await imageResp.arrayBuffer();
};

const invokeGemini = async (imageBuffer, clothDetailsPrompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageBuffer).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    clothDetailsPrompt,
  ]);
  return result.response.text();
};

const invokeMistral = async (url, clothDetailsPrompt) => {
  const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const mistralResponse = await mistralClient.chat.complete({
    model: "pixtral-12b",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: clothDetailsPrompt },
          {
            type: "image_url",
            imageUrl: url,
          },
        ],
      },
    ],
  });
  return mistralResponse.choices[0].message.content;
};

const processWithLLMs = async (llms, imageBuffer, clothDetailsPrompt, url) => {
  for (const llm of llms) {
    try {
      console.log(`Trying LLM: ${llm.name}`);
      const aiResponseText = await llm.invoke(
        imageBuffer,
        clothDetailsPrompt,
        url
      );

      const parsedData = parseToJson(aiResponseText);
      if (parsedData && isValidResponse(parsedData)) {
        return normalizeLLMResponse(parsedData, url); // Return normalized data on success
      } else {
        console.warn(`${llm.name} returned invalid data. Trying next...`);
      }
    } catch (err) {
      console.error(`${llm.name} failed:`, err.message);
    }
  }
  throw new Error("All LLMs failed to process the request.");
};

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

    // Define LLMs in the fallback order
    const llms = [
      {
        name: "Mistral",
        invoke: async (_, clothDetailsPrompt, url) =>
          invokeMistral(url, clothDetailsPrompt),
      },
      {
        name: "Gemini",
        invoke: async (imageBuffer, clothDetailsPrompt) =>
          invokeGemini(imageBuffer, clothDetailsPrompt),
      },

      // Add more LLMs here as needed
    ];

    // Process the request with LLMs
    const normalizedData = await processWithLLMs(
      llms,
      imageBuffer,
      cloth_details_prompt,
      url
    );

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
      description: data.primary_color_details?.description || "",
      hex_codes: data.primary_color_details?.hex_codes || [],
    },
    complementary_colors: {
      shirts: {
        description: data.complementary_colors?.shirts?.description || "",
        hex_codes: data.complementary_colors?.shirts?.hex_codes || [],
      },
      jackets: {
        description: data.complementary_colors?.jackets?.description || "",
        hex_codes: data.complementary_colors?.jackets?.hex_codes || [],
      },
      pants: {
        description: data.complementary_colors?.pants?.description || "",
        hex_codes: data.complementary_colors?.pants?.hex_codes || [],
      },
    },
    selectedOutfit: url,
    id: "1232", // You can generate dynamic IDs here
  };
};

const isValidResponse = (data) => {
  // Ensure the parsed data is an object and contains the required fields
  return (
    data &&
    typeof data === "object" &&
    data.clothing_item &&
    data.primary_color_details &&
    data.primary_color_details.hex_codes &&
    data.primary_color_details.hex_codes.length >= 0 && // Ensures there are hex codes for primary color
    data.complementary_colors &&
    data.complementary_colors.shirts &&
    data.complementary_colors.shirts.description &&
    data.complementary_colors.shirts.hex_codes &&
    data.complementary_colors.shirts.hex_codes.length >= 0 &&
    data.complementary_colors.jackets &&
    data.complementary_colors.jackets.description &&
    data.complementary_colors.jackets.hex_codes &&
    data.complementary_colors.jackets.hex_codes.length >= 0 &&
    data.complementary_colors.pants &&
    data.complementary_colors.pants.description &&
    data.complementary_colors.pants.hex_codes &&
    data.complementary_colors.pants.hex_codes.length >= 0
  );
};

module.exports = { getImageDetailsController };
