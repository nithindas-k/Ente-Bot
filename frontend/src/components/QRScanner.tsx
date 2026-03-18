import { QrCode, RefreshCw, CheckCircle2, Wifi, Smartphone, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';
import { Button } from '@/components/ui/button';
import { useWhatsApp } from '@/context/WhatsAppContext';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function QRScanner({ isWidget = false }: { isWidget?: boolean }) {
    const { status, sessionId, isRefreshing, refreshQr, logout } = useWhatsApp();
    
    // Pairing Code logic (kept local as it's a transient state)
    const [loginMode, setLoginMode] = useState<'qr' | 'code'>('qr');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState<string | null>(null);
    const [isRequestingCode, setIsRequestingCode] = useState(false);

    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber) return;
        
        setIsRequestingCode(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/whatsapp/pairing-code`, { 
                phone: phoneNumber.replace(/\+/g, ''),
                sessionId
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

    const isConnected = status.status === 'connected' || status.status === 'authenticated';
    const qrValue = status.qr;
    const account = status.account;

    if (isConnected) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500",
                isWidget 
                  ? "absolute inset-0 w-full h-full bg-[#0b141a] z-50 px-4 py-2 space-y-3" 
                  : "p-8 bg-neutral-900 border border-emerald-800/50 rounded-xl space-y-4 shadow-2xl shadow-emerald-500/5"
            )}>
                <div className={cn("rounded-full bg-emerald-500/20 flex items-center justify-center", isWidget ? "w-12 h-12" : "w-16 h-16")}>
                    <CheckCircle2 className={cn("text-emerald-500", isWidget ? "w-6 h-6" : "w-8 h-8")} />
                </div>
                <div className="text-center">
                    <h3 className={cn("font-bold text-white leading-tight", isWidget ? "text-lg" : "text-xl")}>
                        {account?.name || "WhatsApp"} Linked!
                    </h3>
                    {account?.phone && <p className="text-[10px] text-neutral-500 font-mono mt-1">+{account.phone}</p>}
                </div>
                <div className="flex flex-col items-center gap-4 w-full pt-2">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Bot Active</span>
                    </div>
                    {!isWidget && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-[10px] font-bold"
                            onClick={logout}
                        >
                            Log out session
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-6 max-w-md w-full animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Connect WhatsApp</h3>
                <p className="text-[11px] text-neutral-500 max-w-[280px] leading-relaxed">
                    Link your mobile device to activate your Ente Bot companion.
                </p>
            </div>

            <div className="flex p-1 bg-black/50 rounded-[18px] w-full border border-neutral-800">
                <button 
                    onClick={() => setLoginMode('qr')}
                    className={cn("flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2", loginMode === 'qr' ? "bg-neutral-800 text-white shadow-lg border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-400")}
                >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR
                </button>
                <button 
                    onClick={() => setLoginMode('code')}
                    className={cn("flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2", loginMode === 'code' ? "bg-neutral-800 text-white shadow-lg border border-neutral-700/50" : "text-neutral-500 hover:text-neutral-400")}
                >
                    <Smartphone className="w-3.5 h-3.5" /> Phone Code
                </button>
            </div>
            
            <div className={cn(
                "relative flex items-center justify-center w-full aspect-square max-w-[280px] rounded-[32px] overflow-hidden group border-4 border-neutral-800/10 shadow-2xl transition-colors duration-500",
                loginMode === 'qr' ? "bg-white p-8" : "bg-neutral-950 p-2"
            )}>
                {!qrValue && loginMode === 'qr' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 space-y-4">
                        <div className="relative">
                            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin opacity-20" />
                            <QrCode className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto" />
                        </div>
                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-[0.25em] animate-pulse">Initializing...</p>
                    </div>
                )}
                
                {loginMode === 'qr' ? (
                    qrValue ? (
                        <div className="w-full h-full flex items-center justify-center bg-white rounded-lg animate-in zoom-in-90 duration-500">
                            <QRCodeSVG value={qrValue} size={256} style={{ width: "100%", height: "100%" }} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-3 opacity-20 transition-opacity">
                            <QrCode className="w-16 h-16 text-neutral-800" />
                            <p className="text-[10px] font-black tracking-widest uppercase">Waiting...</p>
                        </div>
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
                         {pairingCode ? (
                            <div className="text-center space-y-6 animate-in zoom-in-95 w-full">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.3em]">Link Code</p>
                                    <h4 className="text-white text-[10px] font-medium opacity-50">Enter this on your mobile app</h4>
                                </div>
                                <div className="grid grid-cols-4 gap-2.5">
                                    {pairingCode.split('').map((char, i) => (
                                        <div key={i} className="w-full aspect-[3/4] bg-neutral-900 border border-neutral-800 text-white font-mono text-xl font-black rounded-xl flex items-center justify-center shadow-inner hover:border-emerald-500/50 transition-colors">
                                            {char}
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setPairingCode(null)}
                                    className="text-[10px] text-neutral-500 hover:text-emerald-500 transition-colors font-bold uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                            </div>
                         ) : (
                            <form onSubmit={handleRequestCode} className="w-full space-y-5">
                                <div className="space-y-4 text-center">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                        <Smartphone className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-white font-bold text-sm">Link via Phone</h4>
                                        <p className="text-neutral-500 text-[10px] leading-relaxed">Enter your full number with country code<br/>(e.g. 919876543210)</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <input 
                                        type="text" 
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl px-4 text-white text-center font-mono text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-neutral-700"
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={isRequestingCode || !phoneNumber}
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                                    >
                                        {isRequestingCode ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <>Get Link Code <ArrowRight className="w-3.5 h-3.5" /></>}
                                    </Button>
                                </div>
                            </form>
                         )}
                    </div>
                )}
            </div>

            <button 
                onClick={refreshQr}
                disabled={isRefreshing}
                className={cn(
                    "group flex items-center space-x-3 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-neutral-700/50 shadow-xl",
                    isRefreshing ? "text-neutral-500 cursor-not-allowed" : "text-white active:scale-95"
                )}
            >
                <RefreshCw className={cn("w-4 h-4 transition-transform group-hover:rotate-180 duration-500", isRefreshing && "animate-spin text-emerald-500")} />
                <span>{isRefreshing ? "Initializing..." : "Reset Pairing"}</span>
            </button>
        </div>
    );
}
