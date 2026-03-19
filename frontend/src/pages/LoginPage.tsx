import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Bot, Cpu, Globe, Terminal, ShieldCheck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ==========================================
// 21st.dev Inspired Components
// ==========================================

const RetroGrid = () => (
    <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden [perspective:200px]">
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div className="animate-grid absolute inset-0 aspect-square h-[300vh] w-[300vw] -ml-[100vw] -mt-[100vh] border-neutral-900/50 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:60px_60px] [background-position:0_0,0_0] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]"></div>
      </div>
    </div>
);

const ShinyButton = ({ children, onClick, className = '' }: any) => {
    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md px-10 py-5 transition-transform hover:scale-105 active:scale-95 ${className}`}
        >
            <span className="relative z-10 flex items-center justify-center font-black uppercase italic tracking-widest text-[13px] text-white">
                {children}
            </span>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 group-hover:ring-emerald-500/50 transition-colors duration-500"></div>
            {/* Shimmer effect */}
            <div className="absolute -inset-[100%] z-0 rounded-2xl animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.4)_360deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-[2px] rounded-[calc(1rem-2px)] bg-neutral-950 z-0"></div>
            {/* Hover internal glow */}
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hover-glow z-0" />
        </button>
    );
};

const MagicCard = ({ children, className = '', glowColor = 'rgba(16, 185, 129, 0.4)' }: any) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`relative overflow-hidden rounded-[2.5rem] bg-neutral-900/20 p-[1px] group w-full shrink-0 flex flex-col ${className}`}
        >
            {/* Glow effect that tracks mouse */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`
                }}
            />
            {/* Inner dark card covering the center of the glow, leaving only a glowing border */}
            <div className="relative z-10 flex h-full w-full flex-col justify-end overflow-hidden rounded-[calc(2.5rem-1px)] bg-[#0A0A0A]/95 p-8 md:p-12 backdrop-blur-2xl">
                {children}
            </div>
        </div>
    );
};

// ==========================================

export default function LoginPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    // Initialize Smooth Scrolling (Lenis)
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        } as any);

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline();

        // --- HERO ENTRANCE ---
        tl.fromTo(".bg-glow",
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 2, ease: "power2.out" }
        )
            .fromTo(".hero-badge",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
                "-=1.5"
            )
            .fromTo(".hero-title .char",
                { opacity: 0, y: 50, rotateX: -90 },
                { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "back.out(1.5)", stagger: 0.02 },
                "-=1.2"
            )
            .fromTo(".hero-desc",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6 },
                "-=0.8"
            )
            .fromTo(".hero-action",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
                "-=0.6"
            )
            .fromTo(".hero-visual",
                { opacity: 0, scale: 0.9, rotateY: 15, y: 50 },
                { opacity: 1, scale: 1, rotateY: 0, y: 0, duration: 1.2, ease: "elastic.out(1, 0.75)" },
                "-=1"
            );

        // --- CONTINUOUS FLOATING ---
        gsap.to(".float-element", {
            y: "-=15",
            rotation: "+=2",
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: {
                each: 0.5,
                from: "random"
            }
        });

        // --- GRID ANIMATION ---
        gsap.to(".animate-grid", {
            y: "+=60",
            duration: 2,
            ease: "none",
            repeat: -1
        });

        // --- PARALLAX GLOWS ---
        gsap.to(".bg-glow-scroll", {
            yPercent: 50,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        // --- HORIZONTAL SCROLL ANIMATION ---
        const track = document.querySelector('.horizontal-scroll-track') as HTMLElement;
        if (track) {
            // Scroll exact distance required to show the full track until the right edge
            const getScrollAmount = () => -(track.scrollWidth - document.documentElement.clientWidth);

            gsap.to(track, {
                x: getScrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: ".horizontal-scroll-wrapper",
                    start: "top top",
                    end: () => `+=${track.scrollWidth}`, // Scroll timeline proportional to track width
                    scrub: 1,
                    pin: true,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });
        }

        // Footer CTA
        gsap.fromTo(".footer-cta",
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1, scale: 1,
                duration: 1,
                ease: "elastic.out(1, 0.5)",
                scrollTrigger: {
                    trigger: ".footer-section",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );

    }, { scope: containerRef });

    // Helper for splitting text into animated chars
    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className="char inline-block">{char === ' ' ? '\u00A0' : char}</span>
        ));
    };

    return (
        <div ref={containerRef} className="w-full bg-[#050505] text-white font-sans relative overflow-x-hidden selection:bg-emerald-500/30">

            {/* Global Ambient Glows & Retro Grid */}
            <RetroGrid />
            <div className="bg-glow bg-glow-scroll absolute top-[-10%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="bg-glow absolute top-[40%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* ================= HERO SECTION ================= */}
            <section className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 relative z-10">
                <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 pt-20 lg:pt-0">

                    {/* Hero Content */}
                    <div className="flex-1 space-y-10 w-full max-w-2xl text-center lg:text-left perspective-[1000px] relative z-20">
                        <div className="space-y-6">
                            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Companion
                            </div>

                            <h1 className="hero-title text-5xl sm:text-7xl lg:text-[5.5rem] font-black italic tracking-tighter uppercase leading-[0.85] flex flex-wrap justify-center lg:justify-start gap-x-3 drop-shadow-2xl">
                                <div className="overflow-hidden">{splitText("INTELLIGENT")}</div>
                                <div className="text-emerald-500 overflow-hidden text-glow">{splitText("WHATSAPP")}</div>
                                <div className="overflow-hidden">{splitText("AUTOPILOT.")}</div>
                            </h1>

                            <p className="hero-desc text-neutral-400 text-sm sm:text-base md:text-lg font-medium italic leading-relaxed max-w-md mx-auto lg:mx-0 drop-shadow-md">
                                Connect your personal AI brain to WhatsApp. Powered by high-speed Groq LPU inference and localized conversational intelligence.
                            </p>
                        </div>

                        <div className="hero-action flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <ShinyButton onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                                Launch Engine <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </ShinyButton>
                        </div>
                    </div>

                    {/* Hero Visual Mockup */}
                    <div className="hero-visual flex-1 w-full flex justify-center perspective-[1200px] relative mt-10 lg:mt-0 z-20">
                        <div className="relative w-full max-w-[340px] h-[500px]">
                            {/* Card Shell */}
                            <div className="absolute inset-0 bg-[#0d0d0d]/80 backdrop-blur-2xl border border-neutral-800/80 rounded-[2.5rem] p-6 flex flex-col shadow-2xl z-20 overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-neutral-900/80">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                            <Bot className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-20 bg-neutral-800 rounded-full"></div>
                                            <div className="h-1.5 w-12 bg-emerald-500/50 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                                        <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                                        <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full" />
                                    </div>
                                </div>
                                {/* Chat Messages */}
                                <div className="flex-1 py-6 space-y-5">
                                    <div className="flex justify-end float-element" style={{ animationDelay: "0ms" }}>
                                        <div className="bg-[#1a1a1a] border border-neutral-800/80 rounded-2xl rounded-tr-sm px-4 py-3 min-w-[60%] max-w-[80%] shadow-lg space-y-1.5">
                                            <div className="h-1.5 w-full bg-neutral-700/80 rounded-full"></div>
                                            <div className="h-1.5 w-[60%] bg-neutral-700/80 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-end float-element" style={{ animationDelay: "200ms" }}>
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mb-1 shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] shadow-lg shadow-emerald-900/20">
                                            <div className="flex items-center gap-1.5 h-2">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Input box */}
                                <div className="h-12 w-full bg-[#111] rounded-xl border border-neutral-800/80 flex items-center px-4 gap-3 shrink-0 group-hover:border-neutral-700 transition-colors">
                                    <div className="w-5 h-5 rounded-full bg-neutral-800 shrink-0"></div>
                                    <div className="h-1.5 flex-1 bg-neutral-800 rounded-full opacity-50"></div>
                                    <div className="w-6 h-6 rounded-lg bg-emerald-600 flex justify-center items-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                        <ArrowRight className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                            {/* Floating nodes */}
                            <div className="float-element absolute -top-8 -right-8 md:-right-12 w-28 h-28 md:w-32 md:h-32 bg-orange-500/5 border border-orange-500/30 backdrop-blur-xl rounded-full z-10 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.15)]" style={{ animationDelay: "100ms" }}>
                                <div className="text-orange-500 font-mono font-black italic text-xl md:text-2xl tracking-tighter drop-shadow-md">groq</div>
                            </div>
                            <div className="float-element absolute -bottom-10 -left-6 md:-left-10 w-20 h-20 md:w-24 md:h-24 bg-blue-500/5 border border-blue-500/30 backdrop-blur-xl rounded-[2rem] z-30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)] rotate-12" style={{ animationDelay: "300ms" }}>
                                <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-500 drop-shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= HORIZONTAL SCROLL FEATURES ================= */}
            <section className="horizontal-scroll-wrapper w-full h-screen relative z-30 bg-[#050505] flex flex-col justify-center overflow-hidden">

                {/* Section Header */}
                <div className="w-full px-6 md:px-[10vw] mb-12 lg:mb-20 shrink-0 relative z-20">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] mb-4">
                        ENGINEERED FOR <br className="md:hidden" /> <span className="text-emerald-500 drop-shadow-lg">POWER</span>
                    </h2>
                    <p className="text-neutral-400 italic text-sm md:text-lg font-medium max-w-xl">
                        Built with a bleeding-edge architectural stack to endure zero latency and highly contextual responses.
                    </p>
                </div>

                {/* Horizontally Scrolling Track */}
                <div className="w-full relative">
                    <div className="horizontal-scroll-track flex gap-6 md:gap-10 px-6 md:px-[10vw] w-max items-center">

                        {/* Card 1 */}
                        <MagicCard glowColor="rgba(249, 115, 22, 0.4)" className="w-[85vw] md:w-[60vw] max-w-[700px] h-[450px]">
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/20 group-hover:scale-150 transition-all duration-1000" />
                            <Cpu className="w-12 h-12 text-orange-500 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl md:text-4xl font-black uppercase italic mb-4 tracking-tight text-white drop-shadow-md">Groq LPU Engine</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-lg leading-relaxed max-w-lg">Lightning fast inference powered by Groq architecture. Operates at nearly 800 tokens per second for immediate and dynamic WhatsApp responses.</p>
                            </div>
                        </MagicCard>

                        {/* Card 2 */}
                        <MagicCard glowColor="rgba(16, 185, 129, 0.4)" className="w-[85vw] md:w-[35vw] max-w-[450px] h-[450px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 group-hover:scale-150 transition-all duration-1000" />
                            <Globe className="w-12 h-12 text-emerald-500 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-4 tracking-tight drop-shadow-md">Manglish Native</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-base leading-relaxed">Built-in linguistic database natively understands slang heavily customized for local users. Perfect vernacular adaptation.</p>
                            </div>
                        </MagicCard>

                        {/* Card 3 */}
                        <MagicCard glowColor="rgba(59, 130, 246, 0.4)" className="w-[85vw] md:w-[35vw] max-w-[450px] h-[450px]">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-1000" />
                            <ShieldCheck className="w-12 h-12 text-blue-500 mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-4 tracking-tight drop-shadow-md">Secure Isolation</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-base leading-relaxed">Runs completely isolated from official APIs. Employs headless Chrome injection so data never leaks to third parties.</p>
                            </div>
                        </MagicCard>

                        {/* Card 4 */}
                        <MagicCard glowColor="rgba(255, 255, 255, 0.3)" className="w-[85vw] md:w-[60vw] max-w-[700px] h-[450px]">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/40 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                            <Terminal className="w-12 h-12 text-white mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl md:text-4xl font-black uppercase italic mb-4 tracking-tight text-white drop-shadow-md">Advanced Anti-Spam</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-lg leading-relaxed max-w-xl">Human typing simulation, message queue limits, randomized reaction times, and burst protection engineered out-of-the-box to prevent algorithm bans.</p>
                            </div>
                        </MagicCard>

                    </div>
                </div>
            </section>

            {/* ================= BOTTOM CTA ================= */}
            <section className="footer-section w-full py-32 px-6 relative z-20 border-t border-neutral-900 bg-neutral-950 overflow-hidden">
                <RetroGrid />
                <div className="max-w-4xl mx-auto text-center space-y-10 footer-cta relative z-10">
                    <div className="w-20 h-20 mx-auto bg-emerald-600 rounded-[2rem] flex items-center justify-center rotate-12 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:rotate-0 transition-transform duration-500 border border-emerald-400/50">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none drop-shadow-2xl">
                        READY TO DEPLOY?
                    </h2>
                    <ShinyButton onClick={() => navigate('/dashboard')} className="mx-auto block w-max">
                        <div className="flex items-center">
                            Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                    </ShinyButton>
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic mt-10">
                        SYSTEM v1.0 • NITHIN DAS
                    </p>
                </div>
            </section>

        </div>
    );
}
