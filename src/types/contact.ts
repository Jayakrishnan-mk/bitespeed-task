// Prisma now generates the Contact type. We only define API request/response shapes here.

export type ContactResponse = {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
};

export type IdentifyRequest = {
  email?: string;
  phoneNumber?: string;
};
