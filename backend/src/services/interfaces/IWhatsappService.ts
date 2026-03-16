export interface IWhatsappService {
    initialize(): void;
    sendMessage(to: string, content: string): Promise<void>;
}
