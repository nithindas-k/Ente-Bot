export interface IAuthService {
    verifyGoogleToken(idToken: string): Promise<any>;
    generateToken(user: any): string;
}
