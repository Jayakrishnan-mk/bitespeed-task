# Bitespeed Identity Reconciliation Service

A backend service for customer identity reconciliation that helps link different orders made with different contact information to the same person.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure you have MySQL server running.
3. Update the `.env` file with your MySQL connection string for the `DATABASE_URL` variable (e.g., `DATABASE_URL="mysql://user:password@host:port/database_name"`). Prisma will use this.

4. Set up the database schema using Prisma Migrate. This command will create the database if it doesn't exist and apply the schema defined in `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name init
```
   This will also generate the Prisma Client based on your schema.

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /identify

Identifies and links customer contacts based on email or phone number.

**Request Body**
```json
{
  "email": "example@email.com",
  "phoneNumber": "1234567890"
}
```

**Response**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@email.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Features

- Links contacts based on common email or phone number
- Maintains primary-secondary contact relationships
- Automatically creates new contacts when needed
- Returns consolidated contact information
- Handles both new and existing contacts
