export interface IAntiSpamService {
    checkAllRules(fromPhone: string): Promise<boolean>;
    applyHumanDelay(): Promise<void>;
    incrementDailyMessageCount(fromPhone: string): Promise<void>;
}

