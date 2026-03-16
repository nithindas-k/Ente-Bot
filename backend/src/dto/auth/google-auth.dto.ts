import Joi from 'joi';

export interface IGoogleAuthDto {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}

export const googleAuthDtoSchema = Joi.object<IGoogleAuthDto>({
    googleId: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    avatar: Joi.string().uri().optional()
});
