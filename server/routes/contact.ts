import { Router } from 'express';
import { suiteCrmClient } from '../../client/src/lib/suitecrm';

const router = Router();

router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, notes, marketingConsent } = req.body;

    // Create contact in SuiteCRM
    const contactData = {
      first_name: firstName,
      last_name: lastName,
      email1: email,
      phone_mobile: phone || '',
      description: notes || '',
      mkto_consent: marketingConsent ? 'yes' : 'no'
    };

    await suiteCrmClient.createRecord('Contacts', contactData);

    res.status(200).json({ 
      success: true, 
      message: 'Contact created successfully' 
    });
  } catch (error) {
    console.error('Contact creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create contact' 
    });
  }
});

export default router;
