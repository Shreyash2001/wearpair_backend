const cloth_details_prompt = `1. Identify the clothing item in the image (e.g., shirt, pants, jacket, etc.).

2. Describe the primary color of the clothing item in detail.

3. Suggest complementary clothing items that pair well with the detected clothing item, rather than limiting suggestions to predefined categories.

4. Suggest accessories based on gender:
a. Identify whether the item is primarily for men or women—do not return 'Both' as a gender. If it's a unisex item, categorize it under the most commonly worn gender based on fashion standards.
b. For women, suggest handbags, earrings, bracelets, necklaces, and shoes/sandals/footwear with color recommendations and types.
c. For men, suggest footwear, watches, sunglasses, and additional relevant accessories with colors and types.

5. When suggesting colors, include a brief description of the type of clothing that pairs well.

6. Provide the suggested colors as HEX codes in a single line, formatted as:Hex Codes for (shirts/pants/jackets): #XXXXXX, #XXXXXX, #XXXXXX.

The response must follow this strict JSON structure:

{
   "clothing_item": "<string>",
   "primary_color_details": {
       "description": "<string>",
       "hex_codes": ["<string>"]
   },
   "complementary_colors": {
       "topwear": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>"]
       },
       "jackets": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>"]
       },
       "bottomwear": {
           "description": "<string>",
           "recommended_types": "[<string>]",
           "hex_codes": ["<string>"]
       }
   },
    "accessories": {
       "gender": "<string>",
       "women": {
           "handbags": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "earrings": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "bracelets": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "necklaces": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "footwear": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           }
       },
       "men": {
           "footwear": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "watches": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "sunglasses": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "additional_accessories": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           }
       }
   }
}

Additional Rules:

Ensure all fields are present even if the values are empty.

The recommended_types field should specify appropriate styles.

Provide only the JSON response without any additional text or explanation.`;

const occassion_dress_prompt = `1.Extract the following details from the uploaded image:
a.Body Shape: Identify whether the user has a pear, rectangle, inverted triangle, hourglass, or oval body shape.
b.Skin Color: Provide a brief description of the skin tone.
c.Hair Details: Identify the hairstyle and hair color.
d.Approximate Measurements: Estimate waist size, thigh size, and chest size.
2.The user is Going on a Date.
3. Suggest accessories based on gender:
a. Identify whether the item is primarily for men or women—do not return 'Both' as a gender. If it's a unisex item, categorize it under the most commonly worn gender based on fashion standards.
b. For women, suggest handbags, earrings, bracelets, necklaces, and shoes/sandals/footwear with color recommendations and types.
c. For men, suggest footwear, watches, sunglasses, and additional relevant accessories with colors and types.
Give the relevant clothing depending on this points. Try to give atleast 5 topwear and 5 bottomwear and atleast 3 Jackets.
4.Based on the detected features and selected occasion, generate an outfit recommendation in JSON format with the following structure:
{
   "outfit_recommendations": {
       "topwear": {
           "description": "<string>",
           "recommended_types": ["<string>"],
           "hex_codes": ["<string>"]
       },
       "jackets": {
           "description": "<string>",
           "recommended_types": ["<string>"],
           "hex_codes": ["<string>"]
       },
       "bottomwear": {
           "description": "<string>",
           "recommended_types": ["<string>"],
           "hex_codes": ["<string>"]
       },
       "footwear": {
           "description": "<string>",
           "recommended_types": ["<string>"],
           "hex_codes": ["<string>"]
       }
   },
   "accessories": {
       "gender": "<string>",
       "women": {
           "handbags": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "earrings": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "bracelets": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "necklaces": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           }
       },
       "men": {
           "footwear": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "watches": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "sunglasses": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           },
           "additional_accessories": {
               "description": "<string>",
               "recommended_types": ["<string>"],
               "hex_codes": ["<string>"]
           }
       }
   }
}
Additional Rules:
Ensure all fields are present even if the values are empty.
Give Minimum 5 recommendation for each type of clothing.
Provide only the JSON response without any additional text or explanation.`;

module.exports = { cloth_details_prompt, occassion_dress_prompt };
