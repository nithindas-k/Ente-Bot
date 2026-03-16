import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, Wifi } from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function QRScanner() {
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

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
            <div className="flex flex-col items-center justify-center p-8 bg-neutral-900 border border-emerald-800/50 rounded-xl space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">WhatsApp Connected!</h3>
                <p className="text-sm text-neutral-400 text-center">
                    Your bot is live and ready to reply to messages.
                </p>
                <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-700/30 rounded-lg">
                    <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Bot is Active</span>
                </div>
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

            <button className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh QR</span>
            </button>
        </div>
    );
}
