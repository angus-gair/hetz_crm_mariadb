import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';
import { saveConsultation } from '../database';
import { syncService } from '../services/syncService';

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

    console.log('3. Attempting to save consultation to PostgreSQL database');
    let localId;
    try {
      localId = await saveConsultation({
        name,
        email,
        phone,
        notes,
        preferredDate,
        preferredTime
      });
      console.log('4. Consultation saved locally with ID:', localId);

      // Attempt immediate sync but don't wait for it
      syncService.syncConsultationToCRM(localId).catch(error => {
        console.error('Background sync error:', error);
        // Error is logged but doesn't affect the response to the user
      });

      // Return success response
      return res.json({
        success: true,
        message: 'Thank you for your consultation request! Our team will contact you shortly to confirm the details.',
        consultationId: localId
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'We encountered an issue processing your request. Please try again or contact us directly.'
      });
    }

  } catch (error) {
    console.error('8. Fatal error in consultation request:', error);
    return res.status(500).json({
      success: false,
      message: 'We apologize for the inconvenience. Please try again or contact us directly.'
    });
  }
});

export default router;