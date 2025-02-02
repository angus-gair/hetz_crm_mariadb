import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';
import { saveConsultation } from '../database';

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

    // Store consultation data locally first
    const consultationData = {
      name,
      email,
      phone,
      notes,
      preferredDate,
      preferredTime
    };

    // Save to local MySQL database
    const localId = await saveConsultation(consultationData);
    console.log('Consultation saved locally with ID:', localId);

    // Try to sync with SuiteCRM
    const crmResult = await suiteCRMService.createContact(consultationData);

    // Return success response with appropriate message
    res.json({
      success: true,
      message: crmResult.success 
        ? 'Thank you! Your consultation request has been received and processed.'
        : 'Thank you! Your consultation request has been received. We will contact you shortly.',
      details: crmResult.message
    });

  } catch (error) {
    console.error('Failed to process consultation request:', error);
    res.status(500).json({
      success: false,
      message: 'We apologize for the inconvenience. Please try again or contact us directly.'
    });
  }
});

export default router;