import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';

interface WhatsAppStatus {
    status: 'connected' | 'disconnected' | 'authenticating' | 'authenticated';
    qr: string | null;
    account: {
        name: string;
        phone: string;
    } | null;
}

export interface SyncLog {
    id: string;
    message: string;
    progress: number;
    timestamp: Date;
    type: 'info' | 'success' | 'error';
}

interface WhatsAppContextType {
    sessionId: string;
    status: WhatsAppStatus;
    syncLogs: SyncLog[];
    syncProgress: number;
    isRefreshing: boolean;
    refreshQr: () => Promise<void>;
    logout: () => Promise<void>;
    clearLogs: () => void;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

import { toast } from 'sonner';

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
    const [sessionId, setSessionId] = useState<string>(() => {

        const saved = localStorage.getItem('ente_bot_session_id');
        if (saved) return saved;
        const newId = 'session_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('ente_bot_session_id', newId);
        return newId;
    });

    const [status, setStatus] = useState<WhatsAppStatus>({
        status: 'disconnected',
        qr: null,
        account: null,
    });
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
    const [syncProgress, setSyncProgress] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const init = async () => {
            let activeSessionId = sessionId;
            try {
                const activeRes = await axios.get(`${API_BASE_URL}/api/auth/active-session`);
                if (activeRes.data?.sessionId && activeRes.data.sessionId !== sessionId) {
                    console.log(`[Session] Reusing active backend session: ${activeRes.data.sessionId}`);
                    activeSessionId = activeRes.data.sessionId;
                    localStorage.setItem('ente_bot_session_id', activeSessionId);
                    setSessionId(activeSessionId);
                }
            } catch (e) {
                // ignore, proceed with local sessionId
            }

            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/status?sessionId=${activeSessionId}`);
                setStatus(res.data);
                if (res.data.status === 'disconnected') {
                    await axios.get(`${API_BASE_URL}/api/auth/qr?sessionId=${activeSessionId}`);
                }
            } catch (e) {
                toast.error("Failed to connect to WhatsApp service.");
                console.error("Init WhatsApp failed", e);
            }
        };
        init();

        const socketUrl = API_BASE_URL.replace('/api', '');
        const socket = io(socketUrl, { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join-session', sessionId);
        });

        socket.on('qr-update', (data) => {
            setStatus(prev => ({ ...prev, qr: data.qr }));
        });

        socket.on('status-update', (data) => {
            setStatus(data);
            if (data.status === 'connected') {
                toast.success("WhatsApp Connected!");
            }
        });

        socket.on('sync-update', (data: { message: string, progress: number, error?: boolean }) => {
            setSyncProgress(data.progress);
            setSyncLogs((prev: SyncLog[]) => [
                {
                    id: Math.random().toString(36).substring(7),
                    message: data.message,
                    progress: data.progress,
                    timestamp: new Date(),
                    type: (data.error ? 'error' : (data.progress === 100 ? 'success' : 'info')) as 'info' | 'success' | 'error'
                },
                ...prev
            ].slice(0, 50)); // Keep last 50 logs
            
            if (data.error) toast.error(data.message);
            else if (data.progress === 100) toast.success("Contacts Synced Successfully");
        });

        return () => {
            socket.disconnect();
        };
    }, [sessionId]);

    const refreshQr = async () => {
        setIsRefreshing(true);
        setStatus(prev => ({ ...prev, qr: null }));
        try {
            await axios.post(`${API_BASE_URL}/api/auth/whatsapp/refresh`, { sessionId });
            toast.info("Refreshing QR code...");
        } catch (e) {
            toast.error("Refresh failed.");
            console.error("Refresh QR failed", e);
        } finally {
            setTimeout(() => setIsRefreshing(false), 2000);
        }
    };

    const logout = async () => {
        toast.warning("Logout from WhatsApp?", {
            description: "This will permanently clear all your contacts and trained AI personality data.",
            action: {
                label: "Confirm Logout",
                onClick: async () => {
                    try {
                        await axios.post(`${API_BASE_URL}/api/auth/whatsapp/logout`, { sessionId });
                        setSyncLogs([]);
                        setSyncProgress(0);
                        localStorage.removeItem('ente_bot_session_id');
                        toast.success("Logged out successfully");
                        window.location.href = '/';
                    } catch (e) {
                        toast.error("Logout failed.");
                        console.error("Logout failed", e);
                    }
                }
            },
            cancel: {
                label: "Cancel",
                onClick: () => {}
            }
        });
    };

    const clearLogs = () => setSyncLogs([]);

    return (
        <WhatsAppContext.Provider value={{ 
            sessionId, 
            status, 
            syncLogs, 
            syncProgress, 
            isRefreshing, 
            refreshQr, 
            logout,
            clearLogs
        }}>
            {children}
        </WhatsAppContext.Provider>
    );
};

export const useWhatsApp = () => {
    const context = useContext(WhatsAppContext);
    if (!context) throw new Error("useWhatsApp must be used within WhatsAppProvider");
    return context;
};
