export class ContactMapper {
    static toDto(contact: any) {
        return {
            id: contact._id,
            userId: contact.userId,
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            relationship: contact.relationship,
            language: contact.language,
            botEnabled: contact.botEnabled,
            dailyMessageCount: contact.dailyMessageCount,
            lastMessageTime: contact.lastMessageTime
        };
    }
}
