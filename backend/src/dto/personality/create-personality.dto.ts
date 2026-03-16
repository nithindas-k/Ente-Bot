import Joi from 'joi';

export interface ICreatePersonalityDto {
    systemPrompt: string;
    phrases?: string[];
    emojiStyle?: string;
    replyLength?: number;
}

export const createPersonalityDtoSchema = Joi.object<ICreatePersonalityDto>({
    systemPrompt: Joi.string().required(),
    phrases: Joi.array().items(Joi.string()).optional(),
    emojiStyle: Joi.string().optional(),
    replyLength: Joi.number().max(150).optional()
});
