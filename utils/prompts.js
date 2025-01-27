const cloth_details_prompt = `1. Identify the clothing item in the image (e.g., shirt, pants, jacket, etc.). 
   2. Describe the primary color of the clothing item in detail. 
   3. Suggest complementary colors for shirts, pants, or jackets that would pair well with this clothing item. 
   4. Provide the suggested colors as HEX codes in a single line, formatted as: Hex Codes for (shirts/pants/jackets): #XXXXXX, #XXXXXX, #XXXXXX.
   
   The response **must** follow this strict JSON structure:

   {
      "clothing_item": "<string>",
      "primary_color_details": {
          "description": "<string>",
          "hex_codes": ["<string>", "<string>", "<string>"]
      },
      "complementary_colors": {
          "shirts": {
              "description": "<string>",
              "hex_codes": ["<string>", "<string>", "<string>"]
          },
          "jackets": {
              "description": "<string>",
              "hex_codes": ["<string>", "<string>", "<string>"]
          },
          "pants": {
              "description": "<string>",
              "hex_codes": ["<string>", "<string>", "<string>"]
          }
      }
   }

   Ensure all fields are present even if the values are empty. Provide only the JSON response without any additional text or explanation.`;

module.exports = { cloth_details_prompt };
