export class MessageMapper {
    static toDto(message: any) {
        return {
            id: message._id,
            contactId: message.contactId,
            userId: message.userId,
            role: message.role,
            content: message.content,
            language: message.language,
            responseTimeMs: message.responseTimeMs,
            createdAt: message.createdAt
        };
    }
}
