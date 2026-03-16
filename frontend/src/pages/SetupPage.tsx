import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Smartphone } from "lucide-react";
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4">
            <div className="w-full max-w-xl space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Connect PersonaBot
                    </h1>
                    <p className="text-neutral-400">
                        Follow the steps below to link your WhatsApp account to the bot.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h3 className="font-bold text-lg flex items-center space-x-2">
                            <Smartphone className="w-5 h-5 text-emerald-400" />
                            <span>Quick Instructions</span>
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm text-neutral-300">
                            <li>Open <span className="text-white font-medium">WhatsApp</span> on your phone.</li>
                            <li>Go to <span className="text-white font-medium">Settings &gt; Linked Devices</span>.</li>
                            <li>Tap on <span className="text-emerald-400 font-medium">Link a Device</span>.</li>
                            <li>Point your camera to the QR code to connect instantly.</li>
                        </ol>

                        {isConnected && (
                            <div className="flex items-center space-x-2 text-emerald-400 text-sm bg-emerald-950/50 border border-emerald-900/50 p-3 rounded-lg">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Device Linked Successfully!</span>
                            </div>
                        )}
                    </div>

                    <QRScanner />
                </div>

                <div className="flex justify-center">
                    <Button 
                        onClick={handleContinue}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all shadow-xl shadow-emerald-950/20"
                    >
                        <span>Go to Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
