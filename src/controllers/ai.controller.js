const aiService = require('../services/ai.service');
const env = require('../config/env');

/**
 * Handle POST /api/v1/ai/predict-food
 */
const predictFood = async (req, res, next) => {
  try {
    // 1. Validate image upload presence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar (image) wajib diunggah.'
      });
    }

    // 2. Check if AI service is configured
    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured.'
      });
    }

    const description = req.body.description || '';
    
    // 3. Call AI Service
    const prediction = await aiService.predictFoodNutrition(req.file.buffer, description);

    // 4. Return success response
    return res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (err) {
    console.error('[AI Prediction Controller Error]:', err.message);
    
    // If the error itself has a specific status code (e.g. from the service checks)
    const statusCode = err.statusCode || 422;
    return res.status(statusCode).json({
      success: false,
      message: 'Gagal memprediksi makanan menggunakan AI.',
      error: err.message
    });
  }
};

module.exports = {
  predictFood
};
