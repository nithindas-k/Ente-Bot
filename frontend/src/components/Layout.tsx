import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const hideLayout = location.pathname === "/login";

  // Auto-close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Smooth Scroll Initialization (Lenis)
  useEffect(() => {
    if (hideLayout || !scrollContainerRef.current) return;

    const lenis = new Lenis({
        wrapper: scrollContainerRef.current, // Target the scrollable container
        content: contentRef.current || undefined,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Sync with GSAP Tick
    const tickerCb = (time: number) => {
        lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);

    gsap.ticker.lagSmoothing(0);

    return () => {
        lenis.destroy();
        cancelAnimationFrame(rafId);
        gsap.ticker.remove(tickerCb);
    };
  }, [hideLayout]);

  useGSAP(() => {
    if (contentRef.current) {
        gsap.fromTo(contentRef.current, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
    }
  }, [location.pathname]);

  useGSAP(() => {
    // Ambient background animation
    const blobs = gsap.utils.toArray(".bg-blob");
    blobs.forEach((blob: any) => {
        gsap.to(blob, {
            x: "random(-100, 100)",
            y: "random(-100, 100)",
            duration: "random(10, 20)",
            repeat: -1,
            yoyo: true,
            ease: "none"
        });
    });
  }, { scope: containerRef });

  if (hideLayout) {
    return <main className="w-full h-full bg-neutral-950 font-sans relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full bg-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full bg-blob" />
        <div className="relative z-10 w-full h-full">
            {children}
        </div>
    </main>;
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-neutral-950 font-sans text-neutral-100 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full bg-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full bg-blob" />
      
      {/* Sidebar Controlled by Layout */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden z-10">
        {/* Sticky Mobile Navbar (Logo + Trigger) */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Content Container (Scrollable) */}
        <main ref={scrollContainerRef} className="flex-1 relative z-10 w-full h-full overflow-y-auto custom-scrollbar scroll-smooth">
            <div ref={contentRef} className="p-4 md:p-6 max-w-[1600px] mx-auto">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
}
