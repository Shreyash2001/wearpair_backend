const cloth_details_prompt = `1. Identify the clothing item in the image (e.g., shirt, pants, jacket, etc.).

2. Describe the primary color of the clothing item in detail.

3. Suggest complementary colors only for clothing items that are required (e.g., if the image contains a shirt/dress/topwear, suggest only pants and jackets; if it contains pants, suggest only shirts and jackets).

4. When suggesting colors, include a brief description of the type of clothing that pairs well (e.g., "Slim-fit chinos in beige," "Denim jacket in navy blue").

5. Provide the suggested colors as HEX codes in a single line, formatted as:Hex Codes for (shirts/pants/jackets): #XXXXXX, #XXXXXX, #XXXXXX.

The response must follow this strict JSON structure:

{
   "clothing_item": "<string>",
   "primary_color_details": {
       "description": "<string>",
       "hex_codes": ["<string>", "<string>", "<string>"]
   },
   "complementary_colors": {
       "shirts": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>", "<string>", "<string>"]
       },
       "jackets": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>", "<string>", "<string>"]
       },
       "pants": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>", "<string>", "<string>"]
       }
   }
}

Additional Rules:

Ensure all fields are present even if the values are empty.

Only suggest shirts, pants, or jackets if needed based on the uploaded clothing item.

The recommended_types field should specify appropriate styles (e.g., "Slim-fit chinos," "Denim jacket," "Casual linen shirt").

Provide only the JSON response without any additional text or explanation.`;

module.exports = { cloth_details_prompt };
