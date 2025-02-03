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
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Unable to save your consultation. Please try again.'
      });
    }

    // Try to sync with SuiteCRM
    try {
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

      // Even if CRM sync fails, we still return success since we have local data
      return res.json({
        success: true,
        message: crmResult.message || 'Thank you! Your consultation request has been received.',
        localId
      });
    } catch (crmError) {
      console.error('7. CRM sync error:', crmError);
      // Still return success since we have local data
      return res.json({
        success: true,
        message: 'Your consultation request has been received. Our team will contact you shortly.',
        localId
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