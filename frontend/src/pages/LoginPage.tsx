import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageSquare, Bot, Cpu, Globe, Terminal, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function LoginPage() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize Smooth Scrolling (Lenis)
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
        });

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
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.2
        });

        // --- SCROLL ANIMATIONS ---
        // Parallax glows
        gsap.to(".bg-glow-scroll", {
            y: 300,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1
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

            {/* Global Ambient Glows */}
            <div className="bg-glow bg-glow-scroll absolute top-[-10%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="bg-glow absolute top-[40%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* ================= HERO SECTION ================= */}
            <section className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 relative z-10">
                <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 pt-20 lg:pt-0">

                    {/* Hero Content */}
                    <div className="flex-1 space-y-10 w-full max-w-2xl text-center lg:text-left perspective-[1000px]">
                        <div className="space-y-6">
                            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] italic backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Companion
                            </div>

                            <h1 className="hero-title text-5xl sm:text-7xl lg:text-[5.5rem] font-black italic tracking-tighter uppercase leading-[0.85] flex flex-wrap justify-center lg:justify-start gap-x-3">
                                <div className="overflow-hidden">{splitText("INTELLIGENT")}</div>
                                <div className="text-emerald-500 overflow-hidden">{splitText("WHATSAPP")}</div>
                                <div className="overflow-hidden">{splitText("AUTOPILOT.")}</div>
                            </h1>

                            <p className="hero-desc text-neutral-400 text-sm sm:text-base md:text-lg font-medium italic leading-relaxed max-w-md mx-auto lg:mx-0">
                                Connect your personal AI brain to WhatsApp. Powered by high-speed Groq LPU inference and localized conversational intelligence.
                            </p>
                        </div>

                        <div className="hero-action flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="h-14 px-8 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black uppercase italic tracking-widest text-[12px] border-0 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto"
                            >
                                Launch Engine <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Hero Visual Mockup */}
                    <div className="hero-visual flex-1 w-full flex justify-center perspective-[1200px] relative mt-10 lg:mt-0">
                        <div className="relative w-full max-w-[340px] h-[500px]">
                            {/* Card Shell */}
                            <div className="absolute inset-0 bg-[#0d0d0d]/80 backdrop-blur-2xl border border-neutral-800 rounded-[2.5rem] p-6 flex flex-col shadow-2xl z-20 overflow-hidden hover:border-neutral-700/50 transition-colors">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-6 border-b border-neutral-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
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
                                        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl rounded-tr-sm px-4 py-3 min-w-[60%] max-w-[80%] shadow-lg space-y-1.5">
                                            <div className="h-1.5 w-full bg-neutral-700 rounded-full"></div>
                                            <div className="h-1.5 w-[60%] bg-neutral-700 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-end float-element" style={{ animationDelay: "200ms" }}>
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mb-1 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                                            <div className="flex items-center gap-1.5 h-2">
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Input box */}
                                <div className="h-12 w-full bg-[#111] rounded-xl border border-neutral-800 flex items-center px-4 gap-3 shrink-0">
                                    <div className="w-5 h-5 rounded-full bg-neutral-800 shrink-0"></div>
                                    <div className="h-1.5 flex-1 bg-neutral-800 rounded-full opacity-50"></div>
                                    <div className="w-6 h-6 rounded-lg bg-emerald-600 flex justify-center items-center shrink-0">
                                        <ArrowRight className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>
                            {/* Floating nodes */}
                            <div className="float-element absolute -top-8 -right-8 md:-right-12 w-28 h-28 md:w-32 md:h-32 bg-orange-500/5 border border-orange-500/20 backdrop-blur-xl rounded-full z-10 flex items-center justify-center shadow-2xl" style={{ animationDelay: "100ms" }}>
                                <div className="text-orange-500 font-mono font-black italic text-xl md:text-2xl tracking-tighter">groq</div>
                            </div>
                            <div className="float-element absolute -bottom-10 -left-6 md:-left-10 w-20 h-20 md:w-24 md:h-24 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] z-30 flex items-center justify-center shadow-2xl rotate-12" style={{ animationDelay: "300ms" }}>
                                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-neutral-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= HORIZONTAL SCROLL FEATURES ================= */}
            <section className="horizontal-scroll-wrapper w-full h-screen relative z-30 bg-[#050505] flex flex-col justify-center overflow-hidden">

                {/* Section Header */}
                <div className="w-full px-6 md:px-[10vw] mb-12 lg:mb-20 shrink-0">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] mb-4">
                        ENGINEERED FOR <br className="md:hidden" /> <span className="text-emerald-500">POWER</span>
                    </h2>
                    <p className="text-neutral-400 italic text-sm md:text-lg font-medium max-w-xl">
                        Built with a bleeding-edge architectural stack to endure zero latency and highly contextual responses.
                    </p>
                </div>

                {/* Horizontally Scrolling Track */}
                <div className="w-full relative">
                    <div className="horizontal-scroll-track flex gap-6 md:gap-10 px-6 md:px-[10vw] w-max items-center">

                        {/* Card 1 */}
                        <div className="w-[85vw] md:w-[60vw] max-w-[700px] h-[450px] bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-neutral-700/80 transition-all shrink-0 flex flex-col">
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/20 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            <Cpu className="w-12 h-12 text-orange-500 mb-6 relative z-10" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl md:text-4xl font-black uppercase italic mb-4 tracking-tight text-white">Groq LPU Engine</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-lg leading-relaxed max-w-lg">Lightning fast inference powered by Groq architecture. Operates at nearly 800 tokens per second for immediate and dynamic WhatsApp responses.</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="w-[85vw] md:w-[35vw] max-w-[450px] h-[450px] bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-neutral-700/80 transition-all shrink-0 flex flex-col">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            <Globe className="w-12 h-12 text-emerald-500 mb-6 relative z-10" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-4 tracking-tight">Manglish Native</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-base leading-relaxed">Built-in linguistic database natively understands slang heavily customized for local users. Perfect vernacular adaptation.</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="w-[85vw] md:w-[35vw] max-w-[450px] h-[450px] bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-neutral-700/80 transition-all shrink-0 flex flex-col">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            <ShieldCheck className="w-12 h-12 text-blue-500 mb-6 relative z-10" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-2xl md:text-3xl font-black uppercase italic mb-4 tracking-tight">Secure Isolation</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-base leading-relaxed">Runs completely isolated from official APIs. Employs headless Chrome injection so data never leaks to third parties.</p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="w-[85vw] md:w-[60vw] max-w-[700px] h-[450px] bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-neutral-700/80 transition-all shrink-0 flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-800/40 via-transparent to-transparent opacity-50" />
                            <Terminal className="w-12 h-12 text-white mb-6 relative z-10" />
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-3xl md:text-4xl font-black uppercase italic mb-4 tracking-tight text-white">Advanced Anti-Spam</h3>
                                <p className="text-neutral-400 font-medium text-sm md:text-lg leading-relaxed max-w-xl">Human typing simulation, message queue limits, randomized reaction times, and burst protection engineered out-of-the-box to prevent algorithm bans.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= BOTTOM CTA ================= */}
            <section className="footer-section w-full py-32 px-6 relative z-20 border-t border-neutral-900 bg-neutral-950">
                <div className="max-w-4xl mx-auto text-center space-y-10 footer-cta">
                    <div className="w-20 h-20 mx-auto bg-emerald-600 rounded-[2rem] flex items-center justify-center rotate-12 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:rotate-0 transition-transform duration-500">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                        READY TO DEPLOY?
                    </h2>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="h-16 px-12 rounded-2xl bg-white hover:bg-neutral-200 text-black font-black uppercase italic tracking-widest text-[14px] border-0 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-110 active:scale-95 mx-auto"
                    >
                        Enter Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic mt-10">
                        SYSTEM v1.0 • NITHIN DAS
                    </p>
                </div>
            </section>

        </div>
    );
}
