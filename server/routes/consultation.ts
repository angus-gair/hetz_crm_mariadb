import { Router } from 'express';
import { suiteCRMService } from '../services/suitecrm';

const router = Router();

router.post('/schedule-consultation', async (req, res) => {
  try {
    const { name, email, phone, notes, preferredDate, preferredTime } = req.body;

    // Create contact in SuiteCRM
    await suiteCRMService.createContact({
      name,
      email,
      phone,
      notes,
      preferredDate,
      preferredTime
    });

    res.json({ success: true, message: 'Consultation scheduled successfully' });
  } catch (error) {
    console.error('Failed to schedule consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule consultation'
    });
  }
});

export default router;
