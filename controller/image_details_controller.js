const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Mistral } = require("@mistralai/mistralai");
const { Groq } = require("groq-sdk");
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
  console.log(result.response.text());
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

const invokeGroq = async (url, clothDetailsPrompt) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: clothDetailsPrompt,
          },
          {
            type: "image_url",
            image_url: {
              url: url,
            },
          },
        ],
      },
    ],
    model: "llama-3.2-11b-vision-preview",
    temperature: 1,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
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
        name: "Gemini",
        invoke: async (imageBuffer, clothDetailsPrompt) =>
          invokeGemini(imageBuffer, clothDetailsPrompt),
      },
      {
        name: "Mistral",
        invoke: async (_, clothDetailsPrompt, url) =>
          invokeMistral(url, clothDetailsPrompt),
      },
      {
        name: "Groq",
        invoke: async (_, clothDetailsPrompt, url) =>
          invokeGroq(url, clothDetailsPrompt),
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
  return {
    clothing_item: data.clothing_item || "",
    primary_color_details: {
      description: data.primary_color_details?.description || "",
      hex_codes: data.primary_color_details?.hex_codes || [],
    },
    complementary_colors: {
      topwear: {
        description: data.complementary_colors?.topwear?.description || "",
        recommended_types:
          data.complementary_colors?.topwear?.recommended_types || [],
        hex_codes: data.complementary_colors?.topwear?.hex_codes || [],
      },
      jackets: {
        description: data.complementary_colors?.jackets?.description || "",
        recommended_types:
          data.complementary_colors?.jackets?.recommended_types || [],
        hex_codes: data.complementary_colors?.jackets?.hex_codes || [],
      },
      bottomwear: {
        description: data.complementary_colors?.bottomwear?.description || "",
        recommended_types:
          data.complementary_colors?.bottomwear?.recommended_types || [],
        hex_codes: data.complementary_colors?.bottomwear?.hex_codes || [],
      },
    },
    accessories: {
      gender: data.accessories?.gender || "Unspecified",
      women: {
        handbags: {
          description: data.accessories?.women?.handbags?.description || "",
          recommended_types:
            data.accessories?.women?.handbags?.recommended_types || [],
          hex_codes: data.accessories?.women?.handbags?.hex_codes || [],
        },
        earrings: {
          description: data.accessories?.women?.earrings?.description || "",
          recommended_types:
            data.accessories?.women?.earrings?.recommended_types || [],
          hex_codes: data.accessories?.women?.earrings?.hex_codes || [],
        },
        bracelets: {
          description: data.accessories?.women?.bracelets?.description || "",
          recommended_types:
            data.accessories?.women?.bracelets?.recommended_types || [],
          hex_codes: data.accessories?.women?.bracelets?.hex_codes || [],
        },
        necklaces: {
          description: data.accessories?.women?.necklaces?.description || "",
          recommended_types:
            data.accessories?.women?.necklaces?.recommended_types || [],
          hex_codes: data.accessories?.women?.necklaces?.hex_codes || [],
        },
        footwear: {
          description: data.accessories?.women?.footwear?.description || "",
          recommended_types:
            data.accessories?.women?.footwear?.recommended_types || [],
          hex_codes: data.accessories?.women?.footwear?.hex_codes || [],
        },
      },
      men: {
        footwear: {
          description: data.accessories?.men?.footwear?.description || "",
          recommended_types:
            data.accessories?.men?.footwear?.recommended_types || [],
          hex_codes: data.accessories?.men?.footwear?.hex_codes || [],
        },
        watches: {
          description: data.accessories?.men?.watches?.description || "",
          recommended_types:
            data.accessories?.men?.watches?.recommended_types || [],
          hex_codes: data.accessories?.men?.watches?.hex_codes || [],
        },
        sunglasses: {
          description: data.accessories?.men?.sunglasses?.description || "",
          recommended_types:
            data.accessories?.men?.sunglasses?.recommended_types || [],
          hex_codes: data.accessories?.men?.sunglasses?.hex_codes || [],
        },
        additional_accessories: {
          description:
            data.accessories?.men?.additional_accessories?.description || "",
          recommended_types:
            data.accessories?.men?.additional_accessories?.recommended_types ||
            [],
          hex_codes:
            data.accessories?.men?.additional_accessories?.hex_codes || [],
        },
      },
    },
    selectedOutfit: url,
    id: "1232", // You can generate dynamic IDs here
  };
};

const isValidResponse = (data) => {
  if (
    data &&
    typeof data === "object" &&
    data.clothing_item &&
    data.primary_color_details &&
    data.primary_color_details.hex_codes &&
    data.primary_color_details.hex_codes.length >= 0 &&
    data.complementary_colors &&
    data.complementary_colors.topwear &&
    typeof data.complementary_colors.topwear.description === "string" &&
    data.complementary_colors.topwear.hex_codes &&
    data.complementary_colors.topwear.hex_codes.length >= 0 &&
    data.complementary_colors.jackets &&
    typeof data.complementary_colors.jackets.description === "string" &&
    data.complementary_colors.jackets.hex_codes &&
    data.complementary_colors.jackets.hex_codes.length >= 0 &&
    data.complementary_colors.bottomwear &&
    typeof data.complementary_colors.bottomwear.description === "string" &&
    data.complementary_colors.bottomwear.hex_codes &&
    data.complementary_colors.bottomwear.hex_codes.length >= 0
  ) {
    return true;
  } else {
    console.log("i failed");
    return false;
  }
};

module.exports = { getImageDetailsController };
