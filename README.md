# Bitespeed Identity Reconciliation Service

Backend service for customer identity reconciliation. It consolidates contact information based on email addresses or phone numbers.

## Live API Endpoint

The `/identify` endpoint is hosted on Render and can be accessed at:

[`https://identity-reconciliation-bitespeed-oem6.onrender.com/identify`](https://identity-reconciliation-bitespeed-oem6.onrender.com/identify)

### Request Body

Send a `POST` request with a JSON body:

```json
{
  "email": "example@email.com",
  "phoneNumber": "1234567890"
}
```
*   At least one of `email` or `phoneNumber` must be provided.

### Response Body

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Features

- Links contacts based on common email or phone number.
- Maintains primary-secondary contact relationships.
- Automatically creates new contacts when needed.
- Returns consolidated contact information.
