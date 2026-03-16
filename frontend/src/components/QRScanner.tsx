import { useState, useEffect } from 'react';
import { QrCode, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

export default function QRScanner() {
    const [qrValue, setQrValue] = useState<string | null>(null);

    useEffect(() => {
        const fetchQr = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/qr");
                if (response.data?.qr) {
                    setQrValue(response.data.qr);
                }
            } catch (error) {
                console.error("Error fetching QR:", error);
            }
        };

        fetchQr();
        const interval = setInterval(fetchQr, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

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
                    <QrCode className="w-32 h-32 text-neutral-400" />
                )}
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-white transition-colors">
                <RefreshCw className="w-4 h-4 animation-spin" />
                <span>Refresh QR</span>
            </button>
        </div>
    );
}
