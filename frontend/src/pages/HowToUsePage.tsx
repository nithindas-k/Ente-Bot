import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Bot, CheckCircle2,
  Sparkles, ShieldCheck, BookOpen, ArrowRight, Lock,
  Users, ToggleLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// ─── BROWSER/LAPTOP FRAME ────────────────────────────────────
function BrowserFrame({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="w-full h-full bg-[#0d0d0d] rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-[#1a1a1a] px-4 py-2.5 flex items-center gap-3 shrink-0 border-b border-black">
        <div className="flex gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-[#0d0d0d] rounded-md py-1 px-3 text-[9px] text-neutral-500 font-mono flex items-center gap-2 border border-neutral-800/50">
          <Lock className="w-2 h-2 opacity-30" />
          <span className="truncate opacity-60 text-[8px]">{url}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

// ─── SIDEBAR MOCK ────────────────────────────────────────────
function MockSidebar({ active }: { active: string }) {
  return (
    <div className="w-36 bg-neutral-950 border-r border-neutral-900 flex flex-col p-2.5 gap-1.5 shrink-0">
      <div className="flex items-center gap-2 px-2 py-1.5 mb-1.5">
        <div className="w-5 h-5 bg-emerald-600 rounded-md flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-white text-[11px] font-bold">Ente Bot</span>
      </div>
      {["Dashboard", "Contacts", "Settings"].map(l => (
        <div key={l} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors",
          l === active ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20" : "text-neutral-500")}>
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", l === active ? "bg-emerald-500" : "bg-neutral-700")} />
          {l}
        </div>
      ))}
    </div>
  );
}

// ─── STEP DEFINITIONS ────────────────────────────────────────
const Steps = [
  {
    title: "Go to Contacts",
    desc: "Open the Contacts page from the sidebar to see all your synced WhatsApp contacts.",
    tag: "Step 1 of 4",
    url: "ente-bot.app/contacts",
    icon: Users,
    color: "emerald",
    bullets: ["Click 'Contacts' in the left sidebar", "All synced WhatsApp chats appear here", "See each contact's current bot status"],
    mobilePreview: () => (
      <div className="p-2 space-y-1.5 h-full bg-black/40 overflow-hidden">
        <p className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest px-1 mb-1">Contacts</p>
        {[{ name: "Shamy", active: true, hl: true }, { name: "John Doe", active: false, hl: false }, { name: "Priya K", active: false, hl: false }].map(c => (
          <div key={c.name} className={cn("flex items-center justify-between px-2 py-1.5 rounded-lg border",
            c.hl ? "bg-emerald-900/20 border-emerald-500/20" : "bg-neutral-800/40 border-neutral-700/20")}>
            <div className="flex items-center gap-1.5 min-w-0 max-w-[65%]">
              <div className="w-4 h-4 rounded-full bg-neutral-700 flex items-center justify-center text-[5px] font-bold text-neutral-300 shrink-0 uppercase">{c.name.substring(0,2)}</div>
              <span className="text-white text-[7px] font-medium truncate whitespace-nowrap">{c.name}</span>
            </div>
            <div className={cn("flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[4.5px] font-bold uppercase shrink-0",
              c.active ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500")}>
              <ShieldCheck className="w-1.5 h-1.5" />{c.active ? "Active" : "Off"}
            </div>
          </div>
        ))}
      </div>
    ),
    desktop: () => (
      <div className="h-full flex">
        <MockSidebar active="Contacts" />
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">
          <div>
            <p className="text-white text-xs font-bold">Contacts</p>
            <p className="text-neutral-500 text-[10px]">Manage who your bot replies to</p>
          </div>
          <div className="grid grid-cols-2 gap-2 overflow-hidden">
            {[
              { name: "Shamy", phone: "+91 98765", active: true, hl: true },
              { name: "John Doe", phone: "+91 80001", active: false, hl: false },
              { name: "Priya K", phone: "+91 70001", active: false, hl: false },
              { name: "Arun M", phone: "+91 75116", active: false, hl: false },
            ].map(c => (
              <div key={c.name} className={cn("bg-neutral-900 rounded-xl p-3 border flex flex-col gap-2",
                c.hl ? "border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-neutral-800")}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-[9px] font-bold text-neutral-300 shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-bold truncate">{c.name}</p>
                    <p className="text-neutral-500 text-[8px]">{c.phone}</p>
                  </div>
                </div>
                <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border w-fit",
                  c.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700")}>
                  <ShieldCheck className="w-2 h-2" />
                  {c.active ? "Active" : "Ignored"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Whitelist a Contact",
    desc: "Tap the status pill on a contact card to toggle them from Ignored → Active. Only active contacts get AI replies.",
    tag: "Step 2 of 4",
    url: "ente-bot.app/contacts",
    icon: ToggleLeft,
    color: "emerald",
    bullets: ["Tap/click the 'Ignored' pill on a contact", "It turns green and says 'Active'", "That contact will now receive bot replies"],
    mobilePreview: () => (
      <div className="p-2 space-y-1.5 h-full bg-black/40">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-4 h-4 rounded-full bg-neutral-700 flex items-center justify-center text-[5px] font-bold text-neutral-300 shrink-0">SH</div>
            <span className="text-white text-[7px] font-medium whitespace-nowrap truncate">Shamy</span>
          </div>
          <div className="flex items-center gap-1 px-1 py-0.5 rounded-full bg-emerald-500/20 text-[5px] font-bold text-emerald-400 uppercase shrink-0">
             Active
          </div>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-neutral-800/40 border border-neutral-700/20">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-4 h-4 rounded-full bg-neutral-700 flex items-center justify-center text-[5px] font-bold text-neutral-300 shrink-0">JO</div>
            <span className="text-white text-[7px] font-medium opacity-50 whitespace-nowrap truncate">John Doe</span>
          </div>
          <div className="flex items-center gap-1 px-1 py-0.5 rounded-full bg-neutral-800 text-[5px] font-bold text-neutral-500 uppercase shrink-0">
             Off
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-900/40 rounded-lg animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-2 h-2 text-emerald-500 shrink-0" />
          <p className="text-emerald-400 text-[5px] font-bold">Success!</p>
        </div>
      </div>
    ),
    desktop: () => (
      <div className="h-full flex">
        <MockSidebar active="Contacts" />
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">
          <p className="text-white text-xs font-bold">Contacts</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "Shamy", phone: "+91 98765", active: true },
              { name: "John Doe", phone: "+91 80001", active: false },
            ].map((c, idx) => (
              <div key={c.name} className={cn("bg-neutral-900 rounded-xl p-3 border flex flex-col gap-2",
                idx === 0 ? "border-emerald-500/30" : "border-neutral-800")}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-[9px] font-bold text-neutral-300 shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-[10px] font-bold">{c.name}</p>
                    <p className="text-neutral-500 text-[8px]">{c.phone}</p>
                  </div>
                </div>
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[8px] font-bold uppercase w-fit",
                  idx === 0 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-neutral-800 text-neutral-500 border-neutral-700")}>
                  <ShieldCheck className="w-2 h-2" />
                  {idx === 0 ? "Active" : "Ignored"}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <p className="text-emerald-400 text-[9px]">Shamy is now receiving AI-powered replies.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Set AI Personality",
    desc: "Click the ⚙️ icon on a contact to give them a custom AI voice. This step is completely optional.",
    tag: "Step 3 of 4",
    url: "ente-bot.app/personality",
    icon: Bot,
    color: "blue",
    bullets: ["Click the ⚙️ settings icon on a contact card", "Write a custom personality prompt (optional)", "Click Save — the bot will use it for that contact"],
    mobilePreview: () => (
      <div className="p-2.5 space-y-2">
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3 h-3 text-blue-400" />
            <span className="text-blue-300 text-[9px] font-bold">Custom Personality</span>
          </div>
          <p className="text-neutral-500 text-[7px] italic leading-relaxed line-clamp-2">
            "Reply casually in Manglish, be friendly..."
          </p>
          <div className="px-2 py-1 bg-blue-600 rounded-lg text-[7px] font-bold text-white text-center">Save Personality</div>
        </div>
        <div className="bg-neutral-800/40 border border-neutral-700/30 rounded-xl p-2.5 opacity-50">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-neutral-500" />
            <span className="text-neutral-400 text-[9px] font-bold">Default Global AI</span>
          </div>
          <p className="text-neutral-600 text-[7px] mt-1">No action needed</p>
        </div>
      </div>
    ),
    desktop: () => (
      <div className="h-full flex">
        <MockSidebar active="" />
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300 border border-neutral-700 shrink-0">SH</div>
            <div>
              <p className="text-white text-xs font-bold">Shamy — AI Personality</p>
              <p className="text-neutral-500 text-[9px]">Customize this contact's bot voice</p>
            </div>
          </div>
          <div className="flex gap-2 flex-1 min-h-0">
            <div className="flex-1 bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-blue-300 text-[10px] font-bold">Custom Personality</p>
              </div>
              <div className="bg-black/40 rounded-lg px-2.5 py-2 border border-blue-900/40 flex-1">
                <p className="text-[8px] text-neutral-400 italic leading-relaxed line-clamp-4">
                  "Reply casually in Manglish, be friendly and match their tone. Keep responses short unless asked for detail..."
                </p>
              </div>
              <div className="px-3 py-1.5 bg-blue-600 rounded-lg text-[9px] font-bold text-white text-center">Save Personality</div>
            </div>
            <div className="flex-1 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 opacity-50">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-600" />
                <p className="text-neutral-400 text-[10px] font-bold whitespace-nowrap">Default Global AI</p>
              </div>
              <p className="text-[8px] text-neutral-600 leading-relaxed">Uses the system-wide prompt. No action needed.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    desc: "Ente Bot is now running. Whitelisted contacts receive smart, personality-driven AI replies automatically.",
    tag: "Step 4 of 4",
    url: "ente-bot.app/dashboard",
    icon: CheckCircle2,
    color: "emerald",
    bullets: ["Bot runs silently — no action needed", "Replies are sent automatically to active contacts", "View message stats on your Dashboard"],
    mobilePreview: () => (
      <div className="p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-wider">Dashboard</p>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] text-emerald-400 font-bold">Bot Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[{ label: "Listed", value: "3", c: "text-emerald-400" }, { label: "Replies", value: "12", c: "text-blue-400" }, { label: "Up", value: "100%", c: "text-purple-400" }].map(s => (
            <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-center">
              <p className="text-[6px] text-neutral-600">{s.label}</p>
              <p className={cn("text-xs font-bold", s.c)}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-900/20 border border-emerald-800/30 rounded-xl">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <p className="text-emerald-400 text-[8px] font-medium">You're all set!</p>
        </div>
      </div>
    ),
    desktop: () => (
      <div className="h-full flex">
        <MockSidebar active="Dashboard" />
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">
          <div className="flex justify-between items-center">
            <p className="text-white text-xs font-bold">Dashboard</p>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-bold">Bot Active</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Whitelisted", value: "3", color: "text-emerald-400" },
              { label: "Replies Today", value: "12", color: "text-blue-400" },
              { label: "Uptime", value: "100%", color: "text-purple-400" },
            ].map(s => (
              <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5">
                <p className="text-[8px] text-neutral-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-3 flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
            <div>
              <p className="text-white text-[10px] font-bold">You're all set!</p>
              <p className="text-neutral-400 text-[9px] leading-relaxed">Ente Bot is running. Sit back and relax — the AI handles replies for you.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};
const iconColorMap: Record<string, string> = {
  emerald: "text-emerald-500",
  blue: "text-blue-500",
};


// ─── MINI PHONE FRAME (preview illustration) ─────────────────
function MiniPhone({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="w-[145px] aspect-[9/18.5] bg-[#0b141a] rounded-[2rem] border-[3px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col mx-auto relative shrink-0 ring-1 ring-white/5">
      {/* Notch */}
      <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-50">
        <div className="w-10 h-3 bg-neutral-800 rounded-b-lg flex items-center justify-center">
          <div className="w-5 h-0.5 bg-black rounded-full" />
        </div>
      </div>
      {/* App bar */}
      {title && (
        <div className="bg-[#1f2c34] text-white px-3 pt-5 pb-1.5 flex items-center justify-between shrink-0 z-40 border-b border-black/20">
          <span className="font-bold text-[7px] opacity-90 tracking-tight leading-none">{title}</span>
          <div className="flex flex-col gap-0.5 opacity-40 scale-[0.6] items-center justify-center">
            <div className="w-0.5 h-0.5 bg-white rounded-full" />
            <div className="w-0.5 h-0.5 bg-white rounded-full" />
            <div className="w-0.5 h-0.5 bg-white rounded-full" />
          </div>
        </div>
      )}
      {/* Content */}
      <div className={cn("flex-1 overflow-hidden flex flex-col", !title && "pt-4")}>
        {children}
      </div>
      {/* Home bar */}
      <div className="py-1 flex justify-center mt-auto shrink-0">
        <div className="w-8 h-0.5 bg-neutral-600 rounded-full opacity-30" />
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────

export default function HowToUsePage() {
  const [cur, setCur] = useState(0);
  const navigate = useNavigate();

  const step = Steps[cur];
  const isLast = cur === Steps.length - 1;
  const isFirst = cur === 0;
  const StepIcon = step.icon;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">

      {/* ═══ DESKTOP LAYOUT ════════ (hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-8 py-6 gap-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Quick Start Guide
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">How to Use Ente Bot</h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">Follow 4 simple steps to activate automatic AI replies.</p>
        </div>

        {/* Step area */}
        <div className="w-full max-w-5xl grid grid-cols-2 gap-10 items-center">
          {/* Left: browser frame */}
          <div className="w-full h-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`d-frame-${cur}`}
                className="w-full h-full"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28 }}
              >
                <BrowserFrame url={step.url}>{step.desktop()}</BrowserFrame>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: step info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`d-info-${cur}`}
              className="flex flex-col gap-5"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.28 }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{step.tag}</span>
              <h2 className="text-2xl font-extrabold text-white leading-snug">{step.title}</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              <ul className="space-y-2">
                {step.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-[9px] font-bold text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {b}
                  </li>
                ))}
              </ul>
              {/* Progress dots */}
              <div className="flex gap-2">
                {Steps.map((_, i) => (
                  <button key={i} onClick={() => setCur(i)}
                    className={cn("h-1 rounded-full transition-all duration-300", i === cur ? "bg-emerald-500 w-8" : "bg-neutral-700 w-3 hover:bg-neutral-600")} />
                ))}
              </div>
              {/* Buttons */}
              <div className="flex gap-3">
                {!isFirst && (
                  <Button variant="outline" onClick={() => setCur(c => c - 1)}
                    className="h-10 px-4 border-neutral-800 bg-neutral-900/50 text-white text-xs rounded-xl hover:bg-neutral-800">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                )}
                {!isLast ? (
                  <Button onClick={() => setCur(c => c + 1)}
                    className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-0">
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/contacts')}
                    className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-0">
                    Go to Contacts <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ MOBILE LAYOUT ════════ (hidden on desktop) */}
      <div className="flex md:hidden flex-col h-full overflow-hidden">

        {/* ── Sticky top: header + progress ── */}
        <div className="shrink-0 px-5 pt-5 pb-3 border-b border-neutral-800/60 bg-black/30 backdrop-blur-sm">
          {/* Title pill */}
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Quick Start</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{step.tag}</span>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1.5">
            {Steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                className={cn(
                  "flex-1 h-1.5 rounded-full transition-all duration-300",
                  i < cur ? "bg-emerald-600" : i === cur ? "bg-emerald-400" : "bg-neutral-800"
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`m-${cur}`}
              className="px-5 py-5 flex flex-col gap-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0", colorMap[step.color])}>
                  <StepIcon className={cn("w-5 h-5", iconColorMap[step.color])} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white leading-snug">{step.title}</h2>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>

              {/* Phone preview card */}
              <div className="flex items-center justify-center py-2">
                <MiniPhone title="Ente Bot">
                  {step.mobilePreview()}
                </MiniPhone>
              </div>

              {/* Numbered bullets */}
              <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-2xl p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mb-3">Steps</p>
                <ul className="space-y-3">
                  {step.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                      <span className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 text-[9px] font-bold text-neutral-400 flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="leading-none text-[13px]">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom spacing so last card isn't hidden behind nav */}
              <div className="h-2" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sticky bottom nav ── */}
        <div className="shrink-0 px-5 py-4 border-t border-neutral-800/60 bg-black/30 backdrop-blur-sm flex items-center gap-3">
          {!isFirst && (
            <Button variant="outline" onClick={() => setCur(c => c - 1)}
              className="h-11 px-4 border-neutral-800 bg-neutral-900 text-white text-xs rounded-xl hover:bg-neutral-800 flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
          )}
          {!isLast ? (
            <Button onClick={() => setCur(c => c + 1)}
              className="h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl border-0 flex-1">
              Next Step <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button onClick={() => navigate('/contacts')}
              className="h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl border-0 flex-1">
              Go to Contacts <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
