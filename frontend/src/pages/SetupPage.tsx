import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe, ChevronRight, ChevronLeft, ExternalLink,  Smartphone, Monitor, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import QRScanner from "@/components/QRScanner";

// ── MOBILE SHELL ──────────────────────────────────────────────
function PhoneFrame({ children, showHeader = false, title = "" }: { children: React.ReactNode; showHeader?: boolean; title?: string }) {
    return (
        <div className="w-full max-w-[260px] h-[540px] bg-[#0b141a] rounded-[2.5rem] border-[6px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-neutral-700 mx-auto relative">
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
                    <div className="absolute top-2 right-2 w-48 bg-[#233138] rounded-xl shadow-2xl py-2 z-10 animate-in fade-in slide-in-from-top-2">
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
                        {/* More realistic illustration */}
                        <div className="relative w-full h-24 flex items-center justify-center">
                            <div className="absolute left-[20%] w-14 h-24 bg-neutral-800 rounded-xl border-2 border-[#00a884]/30 flex items-center justify-center -rotate-6 shadow-xl">
                                <Smartphone className="w-6 h-6 text-neutral-500" />
                            </div>
                            <div className="absolute right-[20%] w-24 h-16 bg-neutral-800 rounded-lg border-2 border-dashed border-[#00a884]/30 flex items-center justify-center rotate-3 shadow-xl">
                                <Monitor className="w-8 h-8 text-neutral-500" />
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

                    <div className="flex-1 bg-[#111b21]/50 mt-2 px-4 py-4 border-t border-neutral-800/50">
                        <p className="text-[#8696a0] text-[11px] font-bold uppercase tracking-wider mb-4 opacity-70">Device Status</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group opacity-60">
                                <div className="w-10 h-10 rounded-full bg-neutral-800/50 flex items-center justify-center">
                                    <Monitor className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1 border-b border-neutral-800/30 pb-3">
                                    <div className="text-[#e9edef] text-[14px]">Windows</div>
                                    <div className="text-[#8696a0] text-[12px]">Last active today at 12:29 AM</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group opacity-60">
                                <div className="w-10 h-10 rounded-full bg-neutral-800/50 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[#e9edef] text-[14px]">Google Chrome (Mac OS)</div>
                                    <div className="text-[#8696a0] text-[12px]">Last active yesterday at 11:15 PM</div>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-[#8696a0] text-[11px] mt-6 text-center italic">
                            Tap a device to log out.
                        </p>
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
                        <div className="w-full h-full p-3 flex items-center justify-center">
                            <QRScanner isWidget />
                        </div>

                        {/* Viewfinder corners */}
                        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00a884] rounded-tl-lg" />
                        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00a884] rounded-tr-lg" />
                        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00a884] rounded-bl-lg" />
                        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00a884] rounded-br-lg" />

                        {/* Scanning laser line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-[#00a884]/50 top-1/2 animate-scan shadow-[0_0_15px_rgba(0,168,132,0.8)]" />
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
    const navigate = useNavigate();

    const nextStep = () => setCur(prev => Math.min(prev + 1, Steps.length - 1));
    const prevStep = () => setCur(prev => Math.max(prev - 1, 0));

    return (
        <div className="w-full flex flex-col items-center justify-center py-4 md:py-10 animate-in fade-in duration-700">

            <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">

                {/* Left Content */}
                <div className="flex-1 space-y-8 w-full max-w-lg text-center lg:text-left">
                    <div className="space-y-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic mx-auto lg:mx-0">
                            <ShieldCheck className="w-3 h-3" /> Secure Pairing
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={cur}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                                    {Steps[cur].title.split(' ').slice(0, -1).join(' ')} <br />
                                    <span className="text-emerald-500">{Steps[cur].title.split(' ').slice(-1)}</span>
                                </h1>
                                <p className="text-neutral-400 text-sm md:text-base font-medium italic leading-relaxed max-w-sm mx-auto lg:mx-0">
                                    {Steps[cur].desc}
                                </p>
                            </motion.div>
                        </AnimatePresence>
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
                            className="h-10 w-10 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 hover:bg-neutral-800 hover:text-white disabled:opacity-20 transition-all p-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        {cur < Steps.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="h-10 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black font-black uppercase italic tracking-wider text-[10px] border-0 group transition-all"
                            >
                                Next Step <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white uppercase font-black italic tracking-wider text-[10px] border-0 group shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Dashboard <ExternalLink className="w-3 h-3 ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        )}

                    </div>
                </div>

                {/* Right Display (Mobile Hub) */}
                <div className="flex-1 w-full flex justify-center lg:justify-end perspective-[1000px]">
                    <motion.div
                        key={cur}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="w-full flex justify-center"
                    >
                        {Steps[cur].content()}
                    </motion.div>
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
