import Joi from 'joi';

export interface ICreateContactDto {
    name: string;
    phoneNumber: string;
    relationship?: string;
    language?: string;
}

export const createContactDtoSchema = Joi.object<ICreateContactDto>({
    name: Joi.string().required(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(), // E.164
    relationship: Joi.string().optional(),
    language: Joi.string().optional()
});
