import Joi from 'joi';

export interface IIncomingMessageDto {
    from: string;
    body: string;
    timestamp?: Date;
}

export const incomingMessageDtoSchema = Joi.object<IIncomingMessageDto>({
    from: Joi.string().required(),
    body: Joi.string().required(),
    timestamp: Joi.date().optional()
});
