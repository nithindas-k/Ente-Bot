import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe, CheckCircle2, Copy, ExternalLink, ChevronRight, ChevronLeft, Lock, Zap, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config/api.config";


// ── BROWSER SHELL ──────────────────────────────────────────────
function BrowserFrame({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="w-full max-w-[500px] h-[380px] bg-[#0d0d0d] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-neutral-700/50">
      {/* Chrome Toolbar */}
      <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-4 shrink-0 border-b border-black">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#0d0d0d] rounded-lg py-1 px-3 text-[9px] text-neutral-500 font-mono flex items-center gap-2 border border-neutral-800/50">
          <Lock className="w-2.5 h-2.5 opacity-30" />
          <span className="truncate opacity-60 text-[8px]">{url}</span>
        </div>
      </div>
      {/* Viewport */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

// ── MOCK PAGE COMPONENTS ───────────────────────────────────────
const Steps = [
  {
    title: "Access Groq Console",
    desc: "Start by visiting the official Groq Cloud console to manage your high-speed AI processing keys.",
    url: "console.groq.com/keys",
    content: () => (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-orange-500 font-black text-4xl font-mono tracking-tighter italic">groq</div>
        <div className="space-y-2">
            <h4 className="text-white text-sm font-bold">Welcome to Groq Cloud</h4>
            <p className="text-neutral-500 text-[10px] max-w-[200px] mx-auto leading-relaxed">Login to access your high-performance LPU inference engine.</p>
        </div>
        <div className="w-full max-w-[240px] space-y-2">
            <div className="w-full h-10 bg-white text-black rounded-xl flex items-center justify-center text-[11px] font-bold cursor-pointer hover:bg-neutral-200 transition-colors">Continue with Google</div>
            <div className="w-full h-10 bg-neutral-900 border border-neutral-800 text-white rounded-xl flex items-center justify-center text-[11px] font-bold cursor-pointer">Continue with Email</div>
        </div>
      </div>
    )
  },
  {
    title: "Navigate to API Keys",
    desc: "Browse to the 'API Keys' section in the sidebar. This dashboard shows all your active processing bridges.",
    url: "console.groq.com/keys",
    content: () => (
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        <div className="px-5 py-3 border-b border-neutral-900 flex justify-between items-center bg-[#111]">
            <span className="text-orange-500 font-black text-lg font-mono italic">groq</span>
            <div className="flex gap-4 items-center">
                <span className="text-[10px] text-orange-500 border-b-2 border-orange-500 pb-1 font-bold">API Keys</span>
                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">ND</div>
            </div>
        </div>
        <div className="p-6 space-y-5">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-white text-base font-bold">API Keys</h3>
                    <p className="text-neutral-500 text-[10px]">Manage your project API keys. Keep them safe.</p>
                </div>
                <div className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg shadow-orange-600/20 transition-all cursor-pointer">
                    + Create API Key
                </div>
            </div>
            <div className="space-y-2 pt-2">
                {['ChatScope', 'LazyDraft', 'inboxiq'].map(name => (
                    <div key={name} className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/50 group">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-neutral-700" />
                            <span className="text-[11px] font-medium text-white">{name}</span>
                            <span className="text-[9px] text-emerald-500 font-mono opacity-50 italic">gsk_...xxxxx</span>
                        </div>
                        <div className="text-[9px] text-neutral-600">3/17/2026</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
  },
  {
    title: "Generate New Key",
    desc: "Click the '+ Create API Key' button and enter a recognizable name like 'EnteBot' to identify this connection.",
    url: "console.groq.com/keys/create",
    content: () => (
      <div className="h-full flex flex-col relative">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl w-full max-w-[280px] p-5 shadow-2xl scale-100 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-5">
                    <span className="text-white text-sm font-bold tracking-tight">Create API Key</span>
                    <span className="text-neutral-600 text-xs cursor-pointer hover:text-white transition-colors">✕</span>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Name</label>
                        <div className="bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-[10px] text-orange-500 font-bold">EnteBot</div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Expiration</label>
                        <div className="bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-[10px] text-white flex justify-between items-center italic">
                            No Expiration <ChevronRight className="w-2.5 h-2.5 text-neutral-700 rotate-90" />
                        </div>
                    </div>
                    <Button className="w-full bg-orange-600 hover:bg-orange-500 h-9 text-[10px] font-black rounded-xl border-0 uppercase italic mt-2 shadow-xl shadow-orange-600/10">Submit</Button>
                </div>
            </div>
        </div>
        {/* Background content */}
        <div className="opacity-10 pointer-events-none p-6">
            <h3 className="text-white text-base font-bold mb-4">API Keys</h3>
            <div className="h-40 bg-neutral-900 rounded-2xl" />
        </div>
      </div>
    )
  },
  {
    title: "Copy Secret Key",
    desc: "Important: Copy the key immediately. For security, Groq will not display this secret token again.",
    url: "console.groq.com/keys/reveal",
    content: () => (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
            <h4 className="text-white text-sm font-bold">Key Created Successfully</h4>
            <p className="text-neutral-500 text-[10px] leading-relaxed max-w-[240px] mx-auto italic">Copy your secret key now. It will not be shown again once you navigate away.</p>
        </div>
        <div className="w-full max-w-[320px] bg-black border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
            <div className="text-[9px] font-mono text-emerald-400 break-all leading-relaxed lining-nums">
                gsk_mock_key_generated_successfully_copy_now
            </div>
            <Button variant="outline" className="h-9 w-full bg-neutral-900 border-neutral-800 text-[10px] font-bold flex items-center gap-2 hover:bg-neutral-800 rounded-xl hover:text-white transition-all group-hover:border-emerald-500/30">
                <Copy className="w-3 h-3" /> Copy Key
            </Button>
        </div>
      </div>
    )
  },
  {
    title: "Activate EnteBot",
    desc: "Paste your secret key below to connect your personal AI brain. This key is stored securely on your device.",
    url: "ente-bot.app/setup",
    content: ({ apiKey, setApiKey, onSave, saved }: any) => (
      <div className="p-8 h-full flex flex-col justify-center space-y-8 animate-in fade-in duration-500 bg-[#0d0d0d]">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-white/10 group">
                <Zap className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h4 className="text-base font-black text-white italic tracking-tighter uppercase">Link System</h4>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest italic">Identity Verification Required</p>
            </div>
        </div>
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex justify-between">
                    <span>Groq Secret Key</span>
                </label>
                <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                    className={cn(
                        "w-full h-12 bg-neutral-900/50 border rounded-xl px-4 text-sm text-white outline-none focus:ring-1 focus:ring-white/20 transition-all font-mono",
                        apiKey.length > 0 ? (apiKey.startsWith('gsk_') ? "border-emerald-500/30" : "border-red-500/30") : "border-neutral-800"
                    )}
                />
            </div>
            <Button 
                onClick={onSave}
                disabled={apiKey.trim().length < 5 || saved}
                className={cn(
                    "w-full h-12 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all border-0",
                    saved ? "bg-emerald-600 text-white" : "bg-white hover:bg-neutral-200 text-black shadow-lg shadow-white/5"
                )}
            >
                {saved ? "System Linked ✓" : "Connect Custom Brain"}
            </Button>
            {saved && (
                <div className="text-center animate-in slide-in-from-top-2 duration-500 pt-2">
                    <p className="text-emerald-500 text-[10px] font-bold italic">Authorized! Returning to dashboard...</p>
                </div>
            )}
        </div>
      </div>
    )
  }
];

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function ApiKeySetup() {
  const [cur, setCur] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`);
      if (data.user?.groqApiKey) {
        setHasExistingKey(true);
      } else {
          setHasExistingKey(false);
      }
    } catch (err) {
      console.error("Failed to fetch user status", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaved(true);
      await axios.put(`${API_BASE_URL}/api/auth/groq-key`, { apiKey });
      localStorage.setItem("groq_api_key", apiKey);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setSaved(false);
      alert("Failed to save API Key. Please try again.");
    }
  };

  const handleDelete = async () => {
      try {
          await axios.delete(`${API_BASE_URL}/api/auth/groq-key`);
          localStorage.removeItem("groq_api_key");
          setHasExistingKey(false);
          setCur(0);
      } catch (err) {
          alert("Failed to delete API Key.");
      }
  };

  const nextStep = () => setCur(prev => Math.min(prev + 1, Steps.length - 1));
  const prevStep = () => setCur(prev => Math.max(prev - 1, 0));

  if (loading) {
      return (
        <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
            <RefreshCcw className="w-8 h-8 text-neutral-800 animate-spin" />
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest italic">Verifying Authorization...</p>
        </div>
      );
  }

  // Active Key View
  if (hasExistingKey) {
      return (
        <div className="w-full max-w-4xl mx-auto py-12 md:py-24 px-6 animate-in fade-in duration-700">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                            <CheckCircle2 className="w-3 h-3" /> System Active
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                            BOT <br/> <span className="text-emerald-500">POWERED.</span>
                        </h1>
                        <p className="text-neutral-500 text-base font-medium italic leading-relaxed">
                            Your personal Groq API key is currently linked and powering the EnteBot AI engine.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="h-12 px-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black uppercase italic text-[10px] tracking-widest gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete API Key
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-neutral-900 bg-neutral-950">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Wipe Memory?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-neutral-400">
                                        This will remove your custom Groq API key. The bot will fallback to its default processing logic.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white">
                                        Secure Key
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                                    >
                                        Delete Key
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button 
                            onClick={() => navigate('/dashboard')}
                            className="h-12 px-8 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black uppercase italic tracking-wider text-[10px] border-0"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>

                <div className="flex justify-center perspective-[1000px]">
                    <BrowserFrame url="ente-bot.app/status">
                        <div className="p-8 h-full flex flex-col items-center justify-center space-y-8 text-center bg-[#0d0d0d]">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                                <div className="w-20 h-20 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10">
                                    <ShieldCheck className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white text-lg font-black uppercase italic tracking-tighter">Connection High</h4>
                                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest opacity-60">Verified & Secure</p>
                            </div>
                            <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-mono text-neutral-400">gsk_********************</span>
                            </div>
                        </div>
                    </BrowserFrame>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 md:py-10 animate-in fade-in duration-700">
        
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
            
            {/* Left Content */}
            <div className="flex-1 space-y-8 w-full max-w-lg text-center lg:text-left">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] italic mx-auto lg:mx-0">
                       <ShieldCheck className="w-3 h-3" /> Secure Activation
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
                                {Steps[cur].title.split(' ').slice(0, -1).join(' ')} <br/>
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
                            variant="ghost"
                            onClick={() => setCur(0)}
                            className="h-10 px-6 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white uppercase font-black italic tracking-wider text-[10px] border-0"
                        >
                            Review Steps
                        </Button>
                    )}
                    
                    {cur === 0 && (
                        <Button 
                            variant="link" 
                            onClick={() => window.open('https://console.groq.com/keys', '_blank')}
                            className="text-neutral-600 hover:text-emerald-500 text-[9px] font-bold uppercase underline-offset-4 tracking-widest decoration-emerald-500/30 h-10"
                        >
                            Console <ExternalLink className="w-2.5 h-2.5 ml-1.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Display (Browser Hub) */}
            <div className="flex-1 w-full flex justify-center lg:justify-end perspective-[1000px]">
                <motion.div
                    key={cur}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="w-full max-w-[480px]"
                >
                    <BrowserFrame url={Steps[cur].url}>
                        {Steps[cur].content({ apiKey, setApiKey, onSave: handleSave, saved })}
                    </BrowserFrame>
                </motion.div>
            </div>

        </div>

        {/* Footer info */}
        <div className="mt-16 flex items-center justify-center gap-8 opacity-20 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-neutral-500" />
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest italic">Global Endpoint</span>
            </div>
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-neutral-500" />
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest italic">Encrypted Pipeline</span>
            </div>
        </div>
    </div>
  );
}
