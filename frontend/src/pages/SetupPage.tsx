import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Smartphone, Sparkles, ShieldCheck } from "lucide-react";
import QRScanner from "@/components/QRScanner";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
    const [isConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
        }, 15000);
        return () => clearTimeout(timer);
    }, []);

    const handleContinue = () => {
        navigate("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-white p-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="w-full max-w-3xl space-y-8">
                
                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="inline-flex w-12 h-12 bg-emerald-600 rounded-xl items-center justify-center mb-1">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Connect Your <span className="text-emerald-500">WhatsApp</span>
                    </h1>
                    <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
                        Link your device to start your AI-powered companion. It only takes a minute.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Instructions Card */}
                    <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-[1.5rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-24 h-24 text-emerald-500 translate-x-8 -translate-y-8 rotate-12" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center space-x-3 text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Quick Setup Guide</span>
                            </div>
                            
                            <ul className="space-y-4">
                                {[
                                    { step: "1", text: "Open WhatsApp on your phone." },
                                    { step: "2", text: "Navigate to Settings > Linked Devices." },
                                    { step: "3", text: "Tap on 'Link a Device' button." },
                                    { step: "4", text: "Scan the QR code displayed nearby." },
                                ].map((item) => (
                                    <li key={item.step} className="flex items-start space-x-3 group/item">
                                        <span className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-emerald-500 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors shrink-0">
                                            {item.step}
                                        </span>
                                        <p className="text-neutral-300 group-hover/item:text-white transition-colors leading-tight py-0.5 text-xs font-medium">
                                            {item.text}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {isConnected && (
                            <div className="mt-6 flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl animate-in zoom-in-95 duration-500">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-bold text-[10px]">DEVICE LINKED SUCCESSFULLY!</span>
                            </div>
                        )}
                    </div>

                    {/* QR Section */}
                    <div className="bg-neutral-900/30 border border-neutral-800 rounded-[1.5rem] p-4 flex items-center justify-center group relative overflow-hidden backdrop-blur-sm min-h-[250px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <QRScanner />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col items-center space-y-4 pt-2">
                    <Button 
                        onClick={handleContinue}
                        className="bg-white hover:bg-neutral-100 text-neutral-900 px-8 h-12 text-sm font-bold rounded-xl flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98] border-0"
                    >
                        <span>Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4 opacity-50" />
                    </Button>
                    <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Encrypted Connection Secured
                    </p>
                </div>
            </div>
        </div>
    );
}
