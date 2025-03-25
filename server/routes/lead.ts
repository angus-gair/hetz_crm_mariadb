import { Router, Request, Response } from 'express';
import { suiteCRMService } from '../services/suitecrm';

// Create a router for lead-related endpoints
const router = Router();

// POST /api/lead - Create a new lead in SuiteCRM
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, message, company } = req.body;

    // Simple validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required fields'
      });
    }

    // Create the lead using the SuiteCRM service
    console.log('[API] Creating lead in SuiteCRM:', { firstName, lastName, email });
    const result = await suiteCRMService.createLead({
      firstName,
      lastName,
      email,
      phone,
      message,
      company: company || 'Website Lead' // Default if not provided
    });

    if (result.success) {
      console.log('[API] Lead created successfully:', result.id);
      return res.json({
        success: true,
        message: 'Thank you for your interest! Our team will contact you shortly.',
        id: result.id
      });
    } else {
      console.log('[API] Lead creation failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'We encountered an issue submitting your information. Please try again later.',
        error: result.error
      });
    }
  } catch (error) {
    console.error('[API] Error creating lead:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

export default router;