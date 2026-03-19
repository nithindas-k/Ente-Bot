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

export const WhatsAppProvider = ({ children }: { children: ReactNode }) => {
    const [sessionId] = useState(() => {
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
        // Initial status fetch and trigger init
        const init = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/status?sessionId=${sessionId}`);
                setStatus(res.data);
                // Also trigger QR generation if disconnected
                if (res.data.status === 'disconnected') {
                    await axios.get(`${API_BASE_URL}/api/auth/qr?sessionId=${sessionId}`);
                }
            } catch (e) {
                console.error("Init WhatsApp failed", e);
            }
        };
        init();

        const socketUrl = API_BASE_URL.replace('/api', '');
        const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
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
                // Could reset logs here or keep them
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
        } catch (e) {
            console.error("Refresh QR failed", e);
        } finally {
            setTimeout(() => setIsRefreshing(false), 2000);
        }
    };

    const logout = async () => {
        if (!confirm("Logout from WhatsApp?")) return;
        try {
            await axios.post(`${API_BASE_URL}/api/auth/whatsapp/logout`, { sessionId });
            setSyncLogs([]);
            setSyncProgress(0);
        } catch (e) {
            console.error("Logout failed", e);
        }
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
