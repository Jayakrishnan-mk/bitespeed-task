import { ContactService } from '../services/contactService';
import { IdentifyRequest } from '../types/contact';

export class ContactController {
  constructor(private contactService: ContactService) {}

  async identify(req: any, res: any) {
    try {
      const { email, phoneNumber } = req.body;
      
      if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'At least one of email or phoneNumber is required' });
      }

      const response = await this.contactService.identify({
        email,
        phoneNumber: phoneNumber?.toString()
      });

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in identify:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
