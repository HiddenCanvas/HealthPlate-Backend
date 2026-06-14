const axios = require('axios');
const env = require('../config/env');

/**
 * Detect image MIME type from buffer magic numbers (header bytes)
 * Supports JPEG, PNG, WEBP. Defaults to image/jpeg.
 * @param {Buffer} buffer 
 * @returns {string}
 */
const detectMimeType = (buffer) => {
  if (!buffer || buffer.length < 4) return 'image/jpeg';
  
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // WEBP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    if (buffer.length >= 12 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return 'image/webp';
    }
  }
  
  return 'image/jpeg';
};

/**
 * Clamp confidence value between 0 and 100
 * @param {any} val 
 * @returns {number}
 */
const clampConfidence = (val) => {
  const num = Number(val);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, Math.round(num)));
};

/**
 * Analyze food image and return nutrition prediction using Gemini 2.5 Flash
 * @param {Buffer} imageBuffer 
 * @param {string} [description] 
 * @returns {Promise<object>}
 */
const predictFoodNutrition = async (imageBuffer, description) => {
  if (!env.GEMINI_API_KEY) {
    const error = new Error('AI service is not configured.');
    error.statusCode = 503;
    throw error;
  }

  const mimeType = detectMimeType(imageBuffer);
  const base64Image = imageBuffer.toString('base64');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
  
  const textPart = {
    text: `You are a professional nutrition expert. Analyze the food item in the provided image.
Estimate the name of the food (in Indonesian), quantity, portion unit (default: 'Porsi'), estimated serving weight in grams (estimated_serving_g), calories (kcal), protein (g), carbohydrates (g), fat (g), sugar (g), and your estimation confidence level (0-100%).
Provide a brief, clear explanation in Indonesian for your estimation in the reasoning field.
${description ? `Additional user description context: "${description}"` : ''}

You must return ONLY a valid JSON object matching the requested schema. No markdown wrapping (do not wrap in \`\`\`json ... \`\`\`), no extra text.`
  };
  
  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Image
    }
  };
  
  const payload = {
    contents: [
      {
        parts: [textPart, imagePart]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          food_name: { type: 'STRING' },
          quantity: { type: 'NUMBER' },
          unit: { type: 'STRING' },
          estimated_serving_g: { type: 'NUMBER' },
          calories_kcal: { type: 'NUMBER' },
          protein_g: { type: 'NUMBER' },
          carbohydrate_g: { type: 'NUMBER' },
          fat_g: { type: 'NUMBER' },
          sugar_g: { type: 'NUMBER' },
          confidence: { type: 'INTEGER' },
          reasoning: { type: 'STRING' }
        },
        required: [
          'food_name',
          'quantity',
          'unit',
          'estimated_serving_g',
          'calories_kcal',
          'protein_g',
          'carbohydrate_g',
          'fat_g',
          'sugar_g',
          'confidence',
          'reasoning'
        ]
      }
    }
  };
  
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000
  });
  
  const candidates = response.data?.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Gemini did not return any prediction candidates.');
  }
  
  const textResult = candidates[0].content?.parts?.[0]?.text;
  if (!textResult) {
    throw new Error('Gemini returned an empty text content.');
  }
  
  let data;
  try {
    data = JSON.parse(textResult.trim());
  } catch (err) {
    // Attempt parsing inside markdown blocks if any exist
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch (nestedErr) {
        throw new Error('Failed to parse Gemini response text as JSON.');
      }
    } else {
      throw new Error('Failed to parse Gemini response text as JSON.');
    }
  }
  
  // Apply robust validation and safe defaults
  const parsedData = {
    food_name: (data.food_name && typeof data.food_name === 'string')
      ? data.food_name
      : 'Makanan Tidak Terdeteksi',
    quantity: (typeof data.quantity === 'number' && data.quantity > 0)
      ? data.quantity
      : 1,
    unit: (data.unit && typeof data.unit === 'string')
      ? data.unit
      : 'Porsi',
    estimated_serving_g: (typeof data.estimated_serving_g === 'number' && data.estimated_serving_g >= 0)
      ? Math.round(data.estimated_serving_g)
      : 0,
    calories_kcal: (typeof data.calories_kcal === 'number' && data.calories_kcal >= 0)
      ? Math.round(data.calories_kcal)
      : 0,
    protein_g: (typeof data.protein_g === 'number' && data.protein_g >= 0)
      ? Math.round(data.protein_g * 10) / 10
      : 0,
    carbohydrate_g: (typeof data.carbohydrate_g === 'number' && data.carbohydrate_g >= 0)
      ? Math.round(data.carbohydrate_g * 10) / 10
      : 0,
    fat_g: (typeof data.fat_g === 'number' && data.fat_g >= 0)
      ? Math.round(data.fat_g * 10) / 10
      : 0,
    sugar_g: (typeof data.sugar_g === 'number' && data.sugar_g >= 0)
      ? Math.round(data.sugar_g * 10) / 10
      : 0,
    confidence: clampConfidence(data.confidence),
    reasoning: (data.reasoning && typeof data.reasoning === 'string')
      ? data.reasoning
      : ''
  };
  
  return parsedData;
};

module.exports = {
  detectMimeType,
  clampConfidence,
  predictFoodNutrition
};
