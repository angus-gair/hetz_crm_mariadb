import { Router, Request, Response } from 'express';
import { suiteCRMService } from '../services/suitecrm';

const router = Router();

// Test connection to SuiteCRM
router.get('/test-connection', async (_req: Request, res: Response) => {
  try {
    const connectionTest = await suiteCRMService.testConnection();
    return res.json(connectionTest);
  } catch (error) {
    console.error('[API] SuiteCRM connection test error:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to test SuiteCRM connection: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Get authentication token
router.get('/get-token', async (_req: Request, res: Response) => {
  try {
    // Use the existing getValidToken method but expose it for testing
    const token = await (suiteCRMService as any).getValidToken();
    return res.json({ success: true, token });
  } catch (error) {
    console.error('[API] Failed to get SuiteCRM token:', error);
    return res.status(500).json({
      success: false, 
      message: `Failed to get authentication token: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Create a consultation meeting
router.post('/consultations', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, notes, preferredDate, preferredTime } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required fields'
      });
    }
    
    // Create consultation meeting
    const result = await suiteCRMService.createConsultationMeeting({
      name,
      email,
      phone,
      notes,
      preferredDate,
      preferredTime
    });
    
    return res.json(result);
  } catch (error) {
    console.error('[API] Failed to create consultation:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to create consultation: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

// Get CRM modules
router.get('/modules', async (_req: Request, res: Response) => {
  try {
    const modules = await suiteCRMService.getModules();
    return res.json({ success: true, data: modules });
  } catch (error) {
    console.error('[API] Failed to get CRM modules:', error);
    return res.status(500).json({
      success: false,
      message: `Failed to get CRM modules: ${error instanceof Error ? error.message : String(error)}`
    });
  }
});

export { router as crmRoutes };