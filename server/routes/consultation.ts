import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';

const router = Router();

router.post('/schedule-consultation', async (req, res) => {
  try {
    const { name, email, phone, notes, preferredDate, preferredTime } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create contact in SuiteCRM
    try {
      await suiteCRMService.createContact({
        name,
        email,
        phone,
        notes,
        preferredDate,
        preferredTime
      });

      res.json({
        success: true,
        message: 'Consultation scheduled successfully'
      });
    } catch (error) {
      console.error('Failed to schedule consultation:', error);
      // Send a more user-friendly error message
      res.status(503).json({
        success: false,
        message: 'Our scheduling system is temporarily unavailable. Please try again later or contact us directly.'
      });
    }
  } catch (error) {
    console.error('Failed to process consultation request:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    });
  }
});

export default router;