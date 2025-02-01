import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';

const router = Router();

// Store consultation requests temporarily
const pendingConsultations: any[] = [];

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

    // Store consultation request
    const consultationRequest = {
      name,
      email,
      phone,
      notes,
      preferredDate,
      preferredTime,
      timestamp: new Date().toISOString(),
      synced: false
    };

    // Store locally first
    pendingConsultations.push(consultationRequest);
    console.log('New consultation request:', JSON.stringify(consultationRequest, null, 2));

    // Try to sync with SuiteCRM
    const crmResult = await suiteCRMService.createContact(consultationRequest);

    // Update sync status
    consultationRequest.synced = crmResult.success;

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