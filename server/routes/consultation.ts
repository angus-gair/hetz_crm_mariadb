import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';
import { saveConsultation } from '../database';

const router = Router();

router.post('/schedule-consultation', async (req, res) => {
  try {
    console.log('1. Backend received consultation request:', req.body);
    const { name, email, phone, notes, preferredDate, preferredTime } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      console.log('2. Validation failed - Missing required fields:', { name, email, phone });
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    console.log('3. Attempting to save consultation to local MySQL database');
    // Store consultation data locally first
    try {
      const localId = await saveConsultation({
        name,
        email,
        phone,
        notes,
        preferredDate,
        preferredTime
      });
      console.log('4. Consultation saved locally with ID:', localId);

      // Try to sync with SuiteCRM
      console.log('5. Attempting to sync with SuiteCRM');
      const crmResult = await suiteCRMService.createContact({
        name,
        email,
        phone,
        notes,
        preferredDate,
        preferredTime
      });
      console.log('6. SuiteCRM sync result:', crmResult);

      // Return success response with appropriate message
      return res.json({
        success: true,
        message: 'Thank you! Your consultation request has been received.',
        localId
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Unable to process your request. Please try again.'
      });
    }

  } catch (error) {
    console.error('Failed to process consultation request:', error);
    return res.status(500).json({
      success: false,
      message: 'We apologize for the inconvenience. Please try again or contact us directly.'
    });
  }
});

export default router;