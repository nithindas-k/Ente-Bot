import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function QRScanner({ isWidget = false }: { isWidget?: boolean }) {
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setQrValue(null);
        try {
            await axios.post("http://localhost:5000/api/auth/whatsapp/refresh");
        } catch (error) {
            console.error("Failed to refresh QR", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 2000); // 2 second mock spin lock
        }
    };

    useEffect(() => {
        const poll = async () => {
            try {
                // Check connection status first
                const statusRes = await axios.get("http://localhost:5000/api/auth/status");
                if (statusRes.data?.status === 'connected') {
                    setIsConnected(true);
                    return; 
                }

                // Fetch QR if not connected
                const qrRes = await axios.get("http://localhost:5000/api/auth/qr");
                if (qrRes.data?.qr) {
                    setQrValue(qrRes.data.qr);
                }
            } catch (error) {
                console.error("Error polling WhatsApp status:", error);
            }
        };

        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, []);

    if (isConnected) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center",
                isWidget 
                  ? "absolute inset-0 w-full h-full bg-[#0b141a] z-50 px-4 py-2 space-y-3" 
                  : "p-8 bg-neutral-900 border border-emerald-800/50 rounded-xl space-y-4"
            )}>
                <div className={cn("rounded-full bg-[#00a884]/20 flex items-center justify-center", isWidget ? "w-12 h-12" : "w-16 h-16")}>
                    <CheckCircle2 className={cn("text-[#00a884]", isWidget ? "w-6 h-6" : "w-8 h-8")} />
                </div>
                <h3 className={cn("font-bold text-white text-center leading-tight", isWidget ? "text-lg" : "text-xl")}>WhatsApp Connected!</h3>
                <p className="text-xs text-neutral-400 text-center px-2">
                    Your bot is live and ready to reply to messages.
                </p>
                <div className="flex items-center space-x-2 px-3 py-1.5 mt-2 bg-[#00a884]/10 border border-[#00a884]/30 rounded-lg">
                    <Wifi className="w-3.5 h-3.5 text-[#00a884] animate-pulse" />
                    <span className="text-[11px] text-[#00a884] font-medium uppercase tracking-wider">Bot Active</span>
                </div>
            </div>
        );
    }

    if (isWidget) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow-inner relative z-0 group">
                <button 
                   onClick={handleRefresh}
                   disabled={isRefreshing}
                   className="absolute top-1.5 right-1.5 p-2 bg-neutral-100/80 backdrop-blur hover:bg-neutral-200/80 rounded-lg text-neutral-600 opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-emerald-600")} />
                </button>
                {qrValue ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <QRCodeSVG value={qrValue} size={150} style={{ width: "100%", height: "100%" }} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 opacity-40">
                        <QrCode className="w-8 h-8 text-neutral-800" />
                        <p className="text-[10px] text-neutral-600 font-bold tracking-widest">LOADING</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-white">WhatsApp Connection</h3>
            <p className="text-sm text-neutral-400 text-center">Scan this QR code with WhatsApp on your phone to link the bot.</p>
            
            <div className="relative flex items-center justify-center w-64 h-64 bg-white rounded-lg p-4">
                {qrValue ? (
                    <QRCodeSVG
                        value={qrValue}
                        size={256}
                        style={{ width: "100%", height: "100%" }}
                    />
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <QrCode className="w-20 h-20 text-neutral-300" />
                        <p className="text-xs text-neutral-400">Loading QR...</p>
                    </div>
                )}
            </div>

            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                    "flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-700",
                    isRefreshing ? "text-neutral-500 cursor-not-allowed" : "text-white active:scale-95"
                )}
            >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh QR"}</span>
            </button>
        </div>
    );
}
