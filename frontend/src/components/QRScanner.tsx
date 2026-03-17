import { useState, useEffect } from 'react';
import { QrCode, RefreshCw, CheckCircle2, Wifi, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';

export default function QRScanner({ isWidget = false }: { isWidget?: boolean }) {
    const [qrValue, setQrValue] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // Pairing Code logic
    const [loginMode, setLoginMode] = useState<'qr' | 'code'>('qr');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isRequestingCode, setIsRequestingCode] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setQrValue(null);
        setPairingCode(null);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/whatsapp/refresh`);
        } catch (error) {
            console.error("Failed to refresh QR", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 2000); 
        }
    };

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber) return;
        
        setIsRequestingCode(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/whatsapp/pairing-code`, { 
                phone: phoneNumber.replace(/\+/g, '') 
            });
            if (res.data?.success) {
                setPairingCode(res.data.code);
            }
        } catch (err) {
            console.error("Failed to get pairing code", err);
            alert("Failed to generate code. Try refreshing QR first.");
        } finally {
            setIsRequestingCode(false);
        }
    };

    useEffect(() => {
        const poll = async () => {
            try {
                const statusRes = await axios.get(`${API_BASE_URL}/api/auth/status`);
                if (statusRes.data?.status === 'connected') {
                    setIsConnected(true);
                    return; 
                }

                if (loginMode === 'qr') {
                    const qrRes = await axios.get(`${API_BASE_URL}/api/auth/qr`);
                    if (qrRes.data?.qr) {
                        setQrValue(qrRes.data.qr);
                    }
                }
            } catch (error) {
                console.error("Error polling WhatsApp status:", error);
            }
        };

        poll();
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [loginMode]);

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
            <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow-inner relative z-0 group overflow-hidden">
                {loginMode === 'qr' ? (
                    <>
                        <button 
                           onClick={handleRefresh}
                           disabled={isRefreshing}
                           className="absolute top-1.5 right-1.5 p-2 bg-neutral-100/80 backdrop-blur hover:bg-neutral-200/80 rounded-lg text-neutral-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
                        </button>
                        {qrValue ? (
                            <div className="w-full h-full flex items-center justify-center p-2">
                                <QRCodeSVG value={qrValue} size={150} style={{ width: "100%", height: "100%" }} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-2 opacity-40">
                                <QrCode className="w-8 h-8 text-neutral-800" />
                                <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">LOADING</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full p-3 flex flex-col items-center justify-center bg-[#0b141a] text-white space-y-2">
                        {pairingCode ? (
                            <div className="text-center space-y-2 animate-in zoom-in-95">
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">Your Link Code</p>
                                <div className="flex gap-1 justify-center">
                                    {pairingCode.split('').map((char, i) => (
                                        <div key={i} className="w-6 h-8 bg-neutral-800 rounded flex items-center justify-center font-mono text-sm font-bold border border-neutral-700">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[8px] text-neutral-500 pt-1">Enter this on your phone</p>
                                <button onClick={() => setPairingCode(null)} className="text-[8px] text-emerald-500 hover:underline">Try another number</button>
                            </div>
                        ) : (
                            <form onSubmit={handleRequestCode} className="w-full space-y-2">
                                <p className="text-[9px] text-neutral-400 text-center">Enter phone with country code</p>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 919876543210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                                />
                                <button 
                                    type="submit"
                                    disabled={isRequestingCode || !phoneNumber}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2"
                                >
                                    {isRequestingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : "Get Code"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-6 max-w-md w-full">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Connect WhatsApp</h3>
                <p className="text-xs text-neutral-400 max-w-[280px]">Choose your preferred linking method below.</p>
            </div>

            <div className="flex p-1 bg-black rounded-xl w-full">
                <button 
                    onClick={() => setLoginMode('qr')}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2", loginMode === 'qr' ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-500")}
                >
                    <QrCode className="w-3.5 h-3.5" /> QR Code
                </button>
                <button 
                    onClick={() => setLoginMode('code')}
                    className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2", loginMode === 'code' ? "bg-neutral-800 text-white shadow-lg" : "text-neutral-500")}
                >
                    <Smartphone className="w-3.5 h-3.5" /> Phone Code
                </button>
            </div>
            
            <div className="relative flex items-center justify-center w-full aspect-square max-w-[280px] bg-white rounded-2xl p-6 shadow-2xl">
                {loginMode === 'qr' ? (
                    qrValue ? (
                        <div className="w-full h-full flex items-center justify-center p-2 bg-white rounded-lg">
                            <QRCodeSVG value={qrValue} size={256} style={{ width: "100%", height: "100%" }} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-3 opacity-30">
                            <QrCode className="w-16 h-16 text-neutral-800" />
                            <p className="text-[10px] font-black tracking-widest uppercase">Fetching QR...</p>
                        </div>
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-950 rounded-xl p-4 sm:p-6 border border-neutral-800 overflow-hidden">
                         {pairingCode ? (
                            <div className="text-center space-y-4 animate-in zoom-in-95 w-full">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.2em] italic">Authentication Code</p>
                                    <h4 className="text-white text-[10px] font-medium opacity-60">Enter this code on your phone</h4>
                                </div>
                                <div className="grid grid-cols-4 gap-2 px-1">
                                    {pairingCode.split('').map((char, i) => (
                                        <div key={i} className="w-full aspect-[4/5] bg-neutral-900 border border-neutral-800 text-white font-mono text-lg font-black rounded-lg flex items-center justify-center shadow-inner group-hover:border-emerald-500/30 transition-colors">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setPairingCode(null)}
                                    className="text-[9px] text-neutral-500 hover:text-emerald-400 transition-colors uppercase font-bold tracking-widest border-b border-neutral-800 hover:border-emerald-500/30 pb-0.5"
                                >
                                    Use different number
                                </button>
                            </div>
                         ) : (
                            <form onSubmit={handleRequestCode} className="w-full space-y-4">
                                <div className="space-y-3 text-center">
                                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 transform -rotate-3 hover:rotate-0 transition-transform">
                                        <Smartphone className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-white font-bold text-sm tracking-tight">Link with Phone</h4>
                                        <p className="text-neutral-500 text-[9px] leading-tight px-2">Enter number with country code<br/>(e.g. 91xxxxxxxxxx)</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Enter Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full h-10 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-white text-center font-mono text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-neutral-700"
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={isRequestingCode || !phoneNumber}
                                        className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase italic tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 text-[10px]"
                                    >
                                        {isRequestingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Get Link Code <ArrowRight className="w-3 h-3" /></>}
                                    </Button>
                                </div>
                            </form>
                         )}
                    </div>
                )}
            </div>

            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                    "flex items-center space-x-2 px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-bold transition-all",
                    isRefreshing ? "text-neutral-500 cursor-not-allowed" : "text-white active:scale-95 shadow-lg"
                )}
            >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-emerald-500")} />
                <span>{isRefreshing ? "Initializing..." : "Reset Pairing Session"}</span>
            </button>
        </div>
    );
}

