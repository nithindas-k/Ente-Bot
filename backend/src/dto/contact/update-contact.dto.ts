import Joi from 'joi';

export interface IUpdateContactDto {
    name?: string;
    relationship?: string;
    language?: string;
    botEnabled?: boolean;
}

export const updateContactDtoSchema = Joi.object<IUpdateContactDto>({
    name: Joi.string().optional(),
    relationship: Joi.string().optional(),
    language: Joi.string().optional(),
    botEnabled: Joi.boolean().optional()
});
