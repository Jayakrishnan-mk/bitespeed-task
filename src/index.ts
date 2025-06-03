import express from 'express';
import cors from 'cors';
import { ContactService } from './services/contactService';
import { ContactController } from './controllers/contactController';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize services and controllers
const contactService = new ContactService();
const contactController = new ContactController(contactService);

// Routes
app.post('/identify', contactController.identify.bind(contactController));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
