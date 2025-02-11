const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Mistral } = require("@mistralai/mistralai");
const { Groq } = require("groq-sdk");
const {
  cloth_details_prompt,
  occassion_dress_prompt,
  extractImageDetails,
} = require("../utils/prompts");
const {
  parseToJson,
  isValidResponse,
  normalizeLLMResponse,
} = require("../utils/response_utils");

const invokeGeminiForOccassion = async (imageBuffer, clothDetailsPrompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });
  console.log("occassion called");
  const result = await model.generateContent([
    {
      inlineData: {
        data: Buffer.from(imageBuffer).toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    occassion_dress_prompt,
  ]);
  console.log(result.response.text());
  return result.response.text();
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
  console.log(mistralResponse.choices[0].message.content);
  return mistralResponse.choices[0].message.content;
};

const invokeMistralForOccassion = async (url, clothDetailsPrompt) => {
  console.log("Mistral called");
  const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
  const mistralResponse = await mistralClient.chat.complete({
    model: "pixtral-12b",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: occassion_dress_prompt },
          {
            type: "image_url",
            imageUrl: url,
          },
        ],
      },
    ],
  });
  console.log(mistralResponse.choices[0].message.content);
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
    top_p: 1,
    stream: false,
    stop: null,
  });

  console.log(chatCompletion.choices[0].message.content);
  return chatCompletion.choices[0].message.content;
};

const invokeGroqForOccassion = async (url, clothDetailsPrompt) => {
  console.log("groq for occassion called");
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

const invokeLlamaForExtraction = async (url, clothDetailsPrompt) => {
  const hf_api_key = process.env.HUGGING_FACE_API_KEY;
  const body = {
    model: "meta-llama/Llama-3.2-11B-Vision-Instruct",
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
    max_tokens: 3000,
    stream: false,
  };
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hf_api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const processWithLLMs = async (imageBuffer, url) => {
  const llms = [
    // {
    //   name: "Llama",
    //   invoke: async (_, clothDetailsPrompt, url) =>
    //     invokeLlamaForExtraction(url, clothDetailsPrompt),
    // },
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
  ];

  for (const llm of llms) {
    try {
      console.log(`Trying LLM: ${llm.name}`);
      const aiResponseText = await llm.invoke(
        imageBuffer,
        cloth_details_prompt,
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

const processWithLLMsForOccassion = async (imageBuffer, url) => {
  const llms = [
    {
      name: "Gemini",
      invoke: async (imageBuffer, clothDetailsPrompt) =>
        invokeGeminiForOccassion(imageBuffer, clothDetailsPrompt),
    },
    {
      name: "Groq",
      invoke: async (_, clothDetailsPrompt, url) =>
        invokeGroqForOccassion(url, clothDetailsPrompt),
    },

    {
      name: "Mistral",
      invoke: async (_, clothDetailsPrompt, url) =>
        invokeMistralForOccassion(url, clothDetailsPrompt),
    },
  ];

  for (const llm of llms) {
    try {
      console.log(`Trying LLM: ${llm.name}`);
      const aiResponseText = await llm.invoke(
        imageBuffer,
        cloth_details_prompt,
        url
      );

      const parsedData = aiResponseText;
      return parsedData;
    } catch (err) {
      console.error(`${llm.name} failed:`, err.message);
    }
  }
  throw new Error("All LLMs failed to process the request.");
};

const processExtractionWithLLMs = async (imageBuffer, url) => {
  const llms = [
    {
      name: "Mistral",
      invoke: async (_, clothDetailsPrompt, url) =>
        invokeMistral(url, clothDetailsPrompt),
    },
    {
      name: "llama",
      invoke: async (_, clothDetailsPrompt, url) =>
        invokeLlamaForExtraction(url, clothDetailsPrompt),
    },
    {
      name: "Groq",
      invoke: async (_, clothDetailsPrompt, url) =>
        invokeGroq(url, clothDetailsPrompt),
    },
  ];

  for (const llm of llms) {
    try {
      console.log(`Trying LLM: ${llm.name}`);
      const aiResponseText = await llm.invoke(
        imageBuffer,
        extractImageDetails,
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

module.exports = {
  processWithLLMs,
  processWithLLMsForOccassion,
  invokeLlamaForExtraction,
  processExtractionWithLLMs,
};
