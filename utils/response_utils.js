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

const normalizeLLMResponse = (data, url) => {
  return {
    clothing_item: data.clothing_item || "",
    gender: data.gender || "",
    primary_color_details: {
      description: data.primary_color_details?.description || "",
      hex_codes: data.primary_color_details?.hex_codes || [],
    },
    complementary: {
      topwear: {
        description: data.complementary?.topwear?.description || "",
        recommended_types: (
          data.complementary?.topwear?.recommended_types || []
        ).map((type) => ({
          title: type,
          image: [""],
        })),
        hex_codes: data.complementary?.topwear?.hex_codes || [],
      },
      jackets: {
        description: data.complementary?.jackets?.description || "",
        recommended_types: (
          data.complementary?.jackets?.recommended_types || []
        ).map((type) => ({
          title: type,
          image: [""],
        })),
        hex_codes: data.complementary?.jackets?.hex_codes || [],
      },
      bottomwear: {
        description: data.complementary?.bottomwear?.description || "",
        recommended_types: (
          data.complementary?.bottomwear?.recommended_types || []
        ).map((type) => ({
          title: type,
          image: [""],
        })),
        hex_codes: data.complementary?.bottomwear?.hex_codes || [],
      },
    },
    accessories: {
      gender: data.accessories?.gender || "Unspecified",
      women: {
        handbags: {
          description: data.accessories?.women?.handbags?.description || "",
          recommended_types: (
            data.accessories?.women?.handbags?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.women?.handbags?.hex_codes || [],
        },
        earrings: {
          description: data.accessories?.women?.earrings?.description || "",
          recommended_types: (
            data.accessories?.women?.earrings?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.women?.earrings?.hex_codes || [],
        },
        bracelets: {
          description: data.accessories?.women?.bracelets?.description || "",
          recommended_types: (
            data.accessories?.women?.bracelets?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.women?.bracelets?.hex_codes || [],
        },
        necklaces: {
          description: data.accessories?.women?.necklaces?.description || "",
          recommended_types: (
            data.accessories?.women?.necklaces?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.women?.necklaces?.hex_codes || [],
        },
        footwear: {
          description: data.accessories?.women?.footwear?.description || "",
          recommended_types: (
            data.accessories?.women?.footwear?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.women?.footwear?.hex_codes || [],
        },
      },
      men: {
        footwear: {
          description: data.accessories?.men?.footwear?.description || "",
          recommended_types: (
            data.accessories?.men?.footwear?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.men?.footwear?.hex_codes || [],
        },
        watches: {
          description: data.accessories?.men?.watches?.description || "",
          recommended_types: (
            data.accessories?.men?.watches?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.men?.watches?.hex_codes || [],
        },
        sunglasses: {
          description: data.accessories?.men?.sunglasses?.description || "",
          recommended_types: (
            data.accessories?.men?.sunglasses?.recommended_types || []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
          hex_codes: data.accessories?.men?.sunglasses?.hex_codes || [],
        },
        additional_accessories: {
          description:
            data.accessories?.men?.additional_accessories?.description || "",
          recommended_types: (
            data.accessories?.men?.additional_accessories?.recommended_types ||
            []
          ).map((type) => ({
            title: type,
            image: [""],
          })),
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
    data.gender &&
    data.primary_color_details &&
    data.primary_color_details.hex_codes &&
    data.primary_color_details.hex_codes.length >= 0 &&
    data.complementary &&
    data.complementary.topwear &&
    typeof data.complementary.topwear.description === "string" &&
    data.complementary.topwear.hex_codes &&
    data.complementary.topwear.hex_codes.length >= 0 &&
    data.complementary.jackets &&
    typeof data.complementary.jackets.description === "string" &&
    data.complementary.jackets.hex_codes &&
    data.complementary.jackets.hex_codes.length >= 0 &&
    data.complementary.bottomwear &&
    typeof data.complementary.bottomwear.description === "string" &&
    data.complementary.bottomwear.hex_codes &&
    data.complementary.bottomwear.hex_codes.length >= 0
  ) {
    return true;
  } else {
    console.log("i failed");
    return false;
  }
};

module.exports = { parseToJson, normalizeLLMResponse, isValidResponse };
