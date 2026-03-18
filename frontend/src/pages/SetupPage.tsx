import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Globe, ChevronRight, ChevronLeft, ExternalLink, ArrowRight, Camera, CheckCircle2, LogOut, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import QRScanner from "@/components/QRScanner";
import axios from "axios";
import { API_BASE_URL } from "@/config/api.config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── MOBILE SHELL ──────────────────────────────────────────────
function PhoneFrame({ children, showHeader = false, title = "" }: { children: React.ReactNode; showHeader?: boolean; title?: string }) {
    return (
        <div className="phone-frame w-full max-w-[260px] h-[540px] bg-[#0b141a] rounded-[2.5rem] border-[6px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-neutral-700 mx-auto relative cursor-default">
            {/* Top Notch Area */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                <div className="w-24 h-5 bg-neutral-800 rounded-b-xl flex items-center justify-center">
                    <div className="w-12 h-1.5 bg-black rounded-full" />
                </div>
            </div>

            {/* WhatsApp Specific Header */}
            {showHeader && (
                <div className="bg-[#1f2c34] text-white px-4 pt-10 pb-3 flex items-center justify-between shrink-0 shadow-md z-40">
                    <span className="font-semibold text-lg">{title || "WhatsApp"}</span>
                    <div className="flex gap-4">
                        <div className="w-5 h-5 opacity-70" /> {/* Spacer for icons */}
                        <div className="w-5 h-5 opacity-70" />
                        <div className="w-1 h-5 flex flex-col justify-between py-0.5 opacity-70">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewport */}
            <div className={cn("flex-1 overflow-hidden relative", !showHeader && "pt-6")}>
                {children}
            </div>

            {/* Bottom Bar indicator */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-50">
                <div className="w-24 h-1 bg-neutral-600 rounded-full opacity-50" />
            </div>
        </div>
    );
}

// ── MOCK PAGE COMPONENTS ───────────────────────────────────────
const Steps = [
    {
        title: "Open WhatsApp",
        desc: "Launch the official WhatsApp application on your primary mobile device.",
        content: () => (
            <PhoneFrame showHeader title="WhatsApp">
                <div className="h-full bg-[#0b141a] flex flex-col">
                    <div className="px-4 py-2 border-b border-neutral-800 flex gap-4 text-[#8696a0] font-medium text-sm">
                        <span className="border-b-2 border-[#00a884] text-[#00a884] pb-2">Chats</span>
                        <span>Updates</span>
                        <span>Calls</span>
                    </div>
                    <div className="flex-1 overflow-hidden pointer-events-none">
                        {[
                            { name: "Support Team", msg: "How can we help you today?", color: "bg-emerald-500/20 text-emerald-500", initials: "ST" },
                            { name: "John Doe", msg: "✓✓ See you at 5 PM", color: "bg-blue-500/20 text-blue-500", initials: "JD" },
                            { name: "Project Alpha", msg: "Announcements ▸", color: "bg-purple-500/20 text-purple-500", initials: "PA" },
                            { name: "Jane Smith", msg: "Voice message (0:12)", color: "bg-orange-500/20 text-orange-500", initials: "JS" },
                            { name: "Community Hub", msg: "New member joined!", color: "bg-pink-500/20 text-pink-500", initials: "CH" }
                        ].map((item, i) => (
                            <div key={i} className="flex p-3 gap-3 items-center border-b border-neutral-800/60">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-[13px]", item.color)}>
                                    {item.initials}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-[#e9edef] font-medium text-[13px] truncate">{item.name}</div>
                                    <div className="text-[#8696a0] text-[11px] truncate mt-0.5">{item.msg}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </PhoneFrame>
        )
    },
    {
        title: "Access Settings",
        desc: "Tap the three-dot menu icon in the top right, then tap 'Linked devices'.",
        content: () => (
            <PhoneFrame showHeader title="WhatsApp">
                <div className="h-full bg-[#0b141a] relative">
                    {/* Background elements */}
                    <div className="px-4 py-2 border-b border-neutral-800 flex gap-4 text-[#8696a0] font-medium text-sm opacity-30">
                        <span>Chats</span>
                    </div>

                    {/* Fake Dropdown Menu */}
                    <div className="absolute top-2 right-2 w-48 bg-[#233138] rounded-xl shadow-2xl py-2 z-10">
                        <div className="px-4 py-3 text-white text-sm hover:bg-[#182229]">New group</div>
                        <div className="px-4 py-3 text-white text-sm hover:bg-[#182229]">New broadcast</div>
                        <div className="px-4 py-3 text-white text-sm bg-[#182229] border-l-4 border-[#00a884] font-medium flex items-center gap-2">
                            Linked devices
                        </div>
                        <div className="px-4 py-3 text-white text-sm hover:bg-[#182229]">Starred messages</div>
                        <div className="px-4 py-3 text-white text-sm hover:bg-[#182229]">Settings</div>
                    </div>
                </div>
            </PhoneFrame>
        )
    },
    {
        title: "Link a Device",
        desc: "You will see a screen describing 'Use WhatsApp on other devices'. Tap the prominent green 'Link a device' button.",
        content: () => (
            <PhoneFrame showHeader title="Linked devices">
                <div className="h-full flex flex-col bg-[#0b141a] relative overflow-hidden">
                    <div className="py-8 flex flex-col items-center text-center space-y-6 px-6">
                        {/* Realistic illustration replacing icons */}
                        <div className="relative w-full h-[100px] flex items-center justify-center mb-2">
                            <div className="relative flex items-center justify-center w-[140px] h-full mx-auto tracking-tighter">
                                {/* Monitor (Dashed) */}
                                <div className="w-[105px] h-[75px] rounded-[12px] border-[2px] border-dashed border-[#00a884]/60 bg-[#0b141a] absolute right-0 z-10 flex text-center items-center justify-center pb-2">
                                     <div className="flex flex-col items-center translate-x-3 mt-3">
                                         <div className="w-8 h-5 border-[2px] border-neutral-600/60 rounded-[3px]" />
                                         <div className="w-2 h-[3px] bg-neutral-600/60" />
                                         <div className="w-6 h-[2px] bg-neutral-600/60 rounded-full" />
                                     </div>
                                </div>
                                {/* Phone (Solid) */}
                                <div className="w-[60px] h-[95px] rounded-[14px] border-[2px] border-[#00a884] bg-[#0b141a] shadow-lg absolute left-0 z-20 pt-4 flex justify-center">
                                     <div className="w-[14px] h-[22px] border-[2px] border-neutral-600/60 rounded-[4px] absolute right-3 mt-1" />
                                </div>
                                {/* Arrow */}
                                <div className="absolute right-[46px] z-10 bottom-[38%] translate-y-1/2">
                                     <ArrowRight className="w-[18px] h-[18px] text-[#00a884]" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        <p className="text-[#8696a0] text-[13px] pt-4 leading-snug">
                            Use WhatsApp on Web, Desktop, and other devices. <span className="text-emerald-500 cursor-pointer">Learn more</span>
                        </p>

                        <div className="w-full">
                            <Button className="w-full bg-[#00a884] hover:bg-[#008f6f] text-[#111b21] rounded-full h-11 text-sm font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                                Link a device
                            </Button>
                        </div>
                    </div>
                </div>
            </PhoneFrame>
        )
    },
    {
        title: "Scan QR Code",
        desc: "Your camera will open. Point it at the QR code displayed on this screen to connect.",
        content: () => (
            <PhoneFrame showHeader title="Scan QR code">
                <div className="h-full flex flex-col items-center bg-[#0b141a] relative">
                    <div className="px-8 py-6 text-center space-y-2">
                        <p className="text-[#e9edef] text-sm font-medium">Link with QR code</p>
                        <p className="text-[#8696a0] text-[12px] leading-tight">
                            Open web.whatsapp.com, desktop app, or other devices on your computer to scan.
                        </p>
                    </div>

                    {/* Mock Camera Viewfinder */}
                    <div className="w-[210px] h-[210px] bg-black/40 rounded-3xl border-2 border-neutral-800/30 relative flex items-center justify-center overflow-hidden">
                        {/* The actual live QR scanner goes here */}
                        <div className="absolute inset-0 p-5 flex items-center justify-center">
                            <QRScanner isWidget />
                        </div>

                        {/* Viewfinder corners */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00a884] rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00a884] rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00a884] rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00a884] rounded-br-lg" />

                        {/* Scanning laser line */}
                        <div className="absolute left-6 right-6 h-0.5 bg-[#00a884] top-1/2 -translate-y-1/2 animate-scan shadow-[0_0_15px_rgba(0,168,132,0.8)] z-10" />
                    </div>
                    
                    <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-40">
                         <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                             <Camera className="w-6 h-6 text-white" />
                         </div>
                         <span className="text-[10px] text-neutral-500">Camera View</span>
                    </div>
                </div>
            </PhoneFrame>
        )
    }
];

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function SetupPage() {
    const [cur, setCur] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [hasApiKey, setHasApiKey] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/auth/status`);
                setIsConnected(res.data?.status === 'connected');

                // Check API Key status
                const userRes = await axios.get(`${API_BASE_URL}/api/auth/me`);
                setHasApiKey(!!userRes.data?.user?.groqApiKey);
            } catch (err) {
                console.error("Failed to fetch WhatsApp or User status", err);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline();
        
        // Text animation
        tl.fromTo(".step-title", 
            { opacity: 0, x: -50, filter: "blur(10px)" },
            { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, ease: "power4.out" }
        )
        .fromTo(".step-desc",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.6"
        )
        // Phone frame animation
        .fromTo(".phone-display",
            { opacity: 0, scale: 0.8, rotateY: 20 },
            { opacity: 1, scale: 1, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.75)" },
            "-=0.8"
        );
    }, [cur]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await axios.post(`${API_BASE_URL}/api/auth/whatsapp/logout`);
            setIsConnected(false);
            setCur(0);
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const nextStep = () => setCur(prev => Math.min(prev + 1, Steps.length - 1));
    const prevStep = () => setCur(prev => Math.max(prev - 1, 0));

    // Connected UI
    if (isConnected) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20">
                <div className="connected-card w-full max-w-md bg-neutral-900/50 border border-neutral-800/60 rounded-3xl p-8 sm:p-12 text-center space-y-8 backdrop-blur-md shadow-2xl">
                    
                    <div className="mx-auto w-16 h-16 bg-[#00a884]/20 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[#00a884]/20 rounded-full animate-ping opacity-30 delay-150"></div>
                        <CheckCircle2 className="w-8 h-8 text-[#00a884]" strokeWidth={2.5} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            WhatsApp Connected
                        </h1>
                        <p className="text-neutral-400 text-[13px] leading-relaxed max-w-[280px] mx-auto">
                            Your Ente Bot is securely linked and actively listening for incoming messages.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-[#00a884]/10 border border-[#00a884]/20 rounded-full px-4 py-2 flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5 text-[#00a884] animate-pulse" />
                            <span className="text-xs font-semibold text-[#00a884] uppercase tracking-wider">Bot Active</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        {hasApiKey ? (
                            <Button 
                                onClick={() => navigate('/dashboard')}
                                className="bg-white hover:bg-neutral-200 text-black font-medium px-6 h-10 rounded-lg group text-sm w-full sm:w-auto shadow-sm transition-all active:scale-95"
                            >
                                Go to Dashboard
                                <ExternalLink className="w-3.5 h-3.5 ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => navigate('/api-setup')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 h-10 rounded-lg group text-sm w-full sm:w-auto shadow-sm transition-all active:scale-95"
                            >
                                Configure API Key 
                                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    className="border-neutral-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-neutral-400 font-medium px-6 h-10 rounded-lg w-full sm:w-auto text-sm transition-all active:scale-95"
                                >
                                    Disconnect <LogOut className="w-3.5 h-3.5 ml-2 opacity-70" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-neutral-900 border border-neutral-800 text-white p-6 rounded-2xl w-[90vw] sm:max-w-md mx-auto my-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold">Disconnect WhatsApp?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-neutral-400">
                                        This will log your bot out of the current WhatsApp session. You will need to scan the QR code again to reconnect.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2 w-full">
                                    <AlertDialogCancel className="w-full sm:w-1/2 bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700 hover:text-white sm:mt-0">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isLoggingOut ? "Disconnecting..." : "Disconnect"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center py-4 md:py-10">

            <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">

                {/* Left Content */}
                <div className="flex-1 space-y-8 w-full max-w-lg text-center lg:text-left">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic mx-auto lg:mx-0">
                            <ShieldCheck className="w-3 h-3" /> Secure Pairing
                        </div>
                        <div className="space-y-4">
                            <h1 className="step-title text-4xl sm:text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                {Steps[cur].title.split(' ').slice(0, -1).join(' ')} <br />
                                <span className="text-emerald-500">{Steps[cur].title.split(' ').slice(-1)}</span>
                            </h1>
                            <p className="step-desc text-neutral-400 text-sm md:text-base font-medium italic leading-relaxed max-w-sm mx-auto lg:mx-0 min-h-[60px]">
                                {Steps[cur].desc}
                            </p>
                        </div>
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <div className="flex gap-2">
                            {Steps.map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => setCur(i)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-500 cursor-pointer overflow-hidden relative",
                                        i === cur ? "w-10 sm:w-16 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "w-1.5 bg-neutral-800 hover:bg-neutral-700"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest lining-nums italic">
                            Step {cur + 1} / {Steps.length}
                        </span>
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={cur === 0}
                            className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-white disabled:opacity-20 transition-all p-0 active:scale-90"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        {cur < Steps.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="h-10 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black font-black uppercase italic tracking-wider text-[10px] border-0 group transition-all active:scale-95"
                            >
                                Next Step <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white uppercase font-black italic tracking-wider text-[10px] border-0 group shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                            >
                                Dashboard <ExternalLink className="w-3 h-3 ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        )}

                    </div>
                </div>

                {/* Right Display (Mobile Hub) */}
                <div className="flex-1 w-full flex justify-center lg:justify-end perspective-[1000px]">
                    <div className="phone-display w-full flex justify-center">
                        {Steps[cur].content()}
                    </div>
                </div>

            </div>

            {/* Footer info */}
            <div className="mt-16 flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-neutral-500" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest italic">Encrypted Connection</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-neutral-500" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest italic">Local Processing Network</span>
                </div>
            </div>
        </div>
    );
}
