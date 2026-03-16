export class PersonalityMapper {
    static toDto(personality: any) {
        return {
            id: personality._id,
            contactId: personality.contactId,
            userId: personality.userId,
            systemPrompt: personality.systemPrompt,
            phrases: personality.phrases,
            emojiStyle: personality.emojiStyle,
            replyLength: personality.replyLength,
            rawChatSample: personality.rawChatSample,
            trainedAt: personality.trainedAt
        };
    }
}
