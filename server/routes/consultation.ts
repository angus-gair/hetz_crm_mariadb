import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';
import { saveConsultation } from '../database';
import { syncService } from '../services/syncService';
import { testRESTv4Connection } from '../tests/test-crm-connection';

const router = Router();

// Test endpoint - mounted at /api/consultation/test-connection
router.post('/test-connection', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    console.log('[API] Testing CRM connection...');
    const restV4Available = await testRESTv4Connection();

    if (!restV4Available) {
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to SuiteCRM REST v4 API'
      });
    }

    // Test meeting creation
    const testResult = await suiteCRMService.createConsultationMeeting({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      notes: 'Test consultation',
      preferredDate: '2025-02-27',
      preferredTime: '15:30'
    });

    return res.json({
      success: true,
      apiConnection: true,
      meetingCreation: testResult.success,
      details: testResult
    });

  } catch (error) {
    console.error('CRM connection test failed:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Schedule consultation endpoint - mounted at /api/consultation/schedule
router.post('/schedule', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    console.log('1. Backend received consultation request:', {
      ...req.body,
      // Exclude sensitive data from logs
      email: '***@***.com',
      phone: '****'
    });

    const { name, email, phone, notes, preferredDate, preferredTime } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      console.log('2. Validation failed - Missing required fields');
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

      let syncError = null;
      try {
        // Attempt immediate sync to SuiteCRM
        await syncService.syncConsultationToCRM(localId);
        console.log('5. Successfully synced with SuiteCRM');
      } catch (syncErr) {
        console.error('5. SuiteCRM sync failed:', syncErr);
        syncError = syncErr;
      }

      // Return appropriate response based on sync result
      if (syncError) {
        return res.json({
          success: true,
          message: 'Your consultation request has been received. However, there was a temporary issue with our system. Our team will process your request manually.',
          consultationId: localId,
          syncStatus: 'pending'
        });
      }

      return res.json({
        success: true,
        message: 'Thank you for your consultation request! Our team will contact you shortly to confirm the details.',
        consultationId: localId,
        syncStatus: 'completed'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'We encountered an issue processing your request. Please try again or contact us directly.'
      });
    }

  } catch (error) {
    console.error('Fatal error in consultation request:', error);
    return res.status(500).json({
      success: false,
      message: 'We apologize for the inconvenience. Please try again or contact us directly.'
    });
  }
});

export default router;