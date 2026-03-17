import { IAntiSpamService } from './interfaces/IAntiSpamService';
import APP_CONSTANTS from '../constants/app.constant';

export class AntiSpamService implements IAntiSpamService {
    private contactRepo: any; 

    constructor(contactRepo: any) {
        this.contactRepo = contactRepo;
    }

    async checkAllRules(fromPhone: string): Promise<boolean> {
        const contact = await this.contactRepo.findByPhone(null, fromPhone);
        if (!contact || !contact.botEnabled) {
            return false; 
        }
        const now = new Date();
        if (contact.lastMessageTime && (now.getTime() - contact.lastMessageTime.getTime()) < APP_CONSTANTS.ANTI_SPAM.RATE_LIMIT_SEC * 1000) {
            return false;
        }

      
        if (contact.dailyMessageCount >= APP_CONSTANTS.ANTI_SPAM.DAILY_LIMIT) {
            return false;
        }

        return true;
    }

    async applyHumanDelay(): Promise<void> {
        const { MIN, MAX } = APP_CONSTANTS.ANTI_SPAM.DELAY;
        const delay = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    async incrementDailyMessageCount(fromPhone: string): Promise<void> {
        const contact = await this.contactRepo.findByPhone(null, fromPhone);
        if (contact) {
            await this.contactRepo.update(contact._id.toString(), {
                dailyMessageCount: (contact.dailyMessageCount || 0) + 1,
                lastMessageTime: new Date()
            });
        }
    }
}

