import prisma from '../database/connection';
import { Contact, LinkPrecedence } from '@prisma/client';
import { ContactResponse, IdentifyRequest } from '../types/contact';

export class ContactService {
  async identify(request: IdentifyRequest): Promise<ContactResponse> {
    const { email, phoneNumber } = request;

    let contacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : {},
          phoneNumber ? { phoneNumber } : {},
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (contacts.length === 0) {
      // No existing contact, create a new primary contact
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: LinkPrecedence.PRIMARY,
        },
      });
      return this.buildResponse([newContact]);
    }

    // Consolidate contacts
    // Determine the primary contact (the oldest one)
    let primaryContact = contacts.find(c => c.linkPrecedence === LinkPrecedence.PRIMARY) || contacts[0];

    // Check if the request introduces new information or links existing distinct contacts
    const requestEmailExists = email ? contacts.some(c => c.email === email) : true;
    const requestPhoneExists = phoneNumber ? contacts.some(c => c.phoneNumber === phoneNumber) : true;

    let newContactCreated = false;
    // Create a new secondary contact if new information is provided that isn't already linked to the primary
    if ((email && !requestEmailExists) || (phoneNumber && !requestPhoneExists)) {
      if (
        (email && !contacts.some(c => c.email === email)) ||
        (phoneNumber && !contacts.some(c => c.phoneNumber === phoneNumber))
      ) {
        const newSecondaryContact = await prisma.contact.create({
          data: {
            email: email,
            phoneNumber: phoneNumber,
            linkedId: primaryContact.id,
            linkPrecedence: LinkPrecedence.SECONDARY,
          },
        });
        contacts.push(newSecondaryContact);
        newContactCreated = true;
      }
    }

    // Link contacts if the request bridges two previously separate primary contacts
    // or if it links a new piece of information to an existing contact group
    const allLinkedIds = new Set<number>();
    contacts.forEach(c => {
      allLinkedIds.add(c.id);
      if (c.linkedId) allLinkedIds.add(c.linkedId);
    });

    const relevantContacts = await prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(allLinkedIds) } },
                { linkedId: { in: Array.from(allLinkedIds) } },
                email ? { email } : undefined,
                phoneNumber ? { phoneNumber } : undefined,
            ].filter(condition => condition !== undefined) as any[],
            deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
    });

    // Determine the true primary contact from all relevant contacts
    primaryContact = relevantContacts.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    // Update other contacts to become secondary and link to the true primary
    const updates: Promise<any>[] = [];
    for (const contact of relevantContacts) {
      if (contact.id !== primaryContact.id && 
          (contact.linkPrecedence !== LinkPrecedence.SECONDARY || contact.linkedId !== primaryContact.id)) {
        updates.push(
          prisma.contact.update({
            where: { id: contact.id },
            data: {
              linkedId: primaryContact.id,
              linkPrecedence: LinkPrecedence.SECONDARY,
            },
          })
        );
      }
    }
    await Promise.all(updates);
    
    // If a new contact was created, or existing ones were updated, fetch the final consolidated state
    const finalContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id }, 
          { linkedId: primaryContact.id }
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    return this.buildResponse(finalContacts, primaryContact.id);
  }

  private buildResponse(contacts: Contact[], primaryIdOverride?: number): ContactResponse {
    if (contacts.length === 0) {
        // This case should ideally be handled before calling buildResponse
        // or ensure createPrimaryContact returns a valid single contact array
        throw new Error("Cannot build response for empty contacts array");
    }

    const primaryContact = primaryIdOverride 
        ? contacts.find(c => c.id === primaryIdOverride) 
        : contacts.sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    if (!primaryContact) {
        throw new Error("Primary contact could not be determined.");
    }

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    contacts.forEach(contact => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) {
        secondaryContactIds.push(contact.id);
      }
    });
    
    // Ensure primary contact's email and phone are first if they exist
    const sortedEmails = Array.from(emails);
    if (primaryContact.email && sortedEmails.includes(primaryContact.email)) {
        sortedEmails.splice(sortedEmails.indexOf(primaryContact.email), 1);
        sortedEmails.unshift(primaryContact.email);
    }

    const sortedPhoneNumbers = Array.from(phoneNumbers);
    if (primaryContact.phoneNumber && sortedPhoneNumbers.includes(primaryContact.phoneNumber)) {
        sortedPhoneNumbers.splice(sortedPhoneNumbers.indexOf(primaryContact.phoneNumber), 1);
        sortedPhoneNumbers.unshift(primaryContact.phoneNumber);
    }

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: sortedEmails,
        phoneNumbers: sortedPhoneNumbers,
        secondaryContactIds: Array.from(new Set(secondaryContactIds)).sort((a,b) => a - b),
      },
    };
  }
}
