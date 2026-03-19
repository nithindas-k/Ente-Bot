import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { Users, MessageSquare, AlertCircle, LayoutDashboard, Key, BookOpen } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api.config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { useWhatsApp } from "@/context/WhatsAppContext";
import { ActivityLog } from "@/components/ActivityLog";

export default function DashboardPage() {
    const { status: waStatus } = useWhatsApp();
    const navigate = useNavigate();
    const container = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState({
        repliesToday: 0,
        activeContacts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const sid = localStorage.getItem('ente_bot_session_id') || 'default';
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats?sessionId=${sid}`);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
        // Refresh every 5 seconds for live representation
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".dashboard-header", { 
            opacity: 0, 
            x: -30, 
            duration: 0.8, 
            ease: "power3.out" 
        })
        .from(".stat-card", { 
            opacity: 0, 
            y: 30, 
            stagger: 0.1, 
            duration: 0.6, 
            ease: "back.out(1.7)" 
        }, "-=0.4")
        .from(".main-grid-item", { 
            opacity: 0, 
            scale: 0.95, 
            duration: 0.8, 
            ease: "power2.out" 
        }, "-=0.2");
    }, { scope: container });

    return (
        <div ref={container} className="space-y-8">
            <div className="dashboard-header flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-visible">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-emerald-500" />
                        Dashboard
                    </h1>
                    <p className="text-neutral-400 text-xs max-w-sm leading-relaxed">
                        Control your AI Companion's behavior and monitor live activity.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/api-setup')}
                        className="h-10 px-4 rounded-xl border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold text-xs transition-all active:scale-95"
                    >
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                        API Setup
                    </Button>
                    <Button 
                        onClick={() => navigate('/how-to-use')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 h-10 text-xs font-bold rounded-xl flex items-center space-x-1.5 border-0 group transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                    >
                        <BookOpen className="w-4 h-4 mr-0.5" />
                        <span>How to Enable</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="stat-card bg-neutral-900 border-neutral-800 text-white hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Status</CardTitle>
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${waStatus.status === "connected" || waStatus.status === "authenticated" ? "text-emerald-500" : "text-red-500"}`}>
                            {waStatus.status.charAt(0).toUpperCase() + waStatus.status.slice(1)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="stat-card bg-neutral-900 border-neutral-800 text-white hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Replies Today</CardTitle>
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.repliesToday} / 150</div>
                    </CardContent>
                </Card>
                <Card className="stat-card bg-neutral-900 border-neutral-800 text-white hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active Contacts</CardTitle>
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.activeContacts}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="main-grid-item lg:col-span-5 h-full">
                    <QRScanner />
                </div>
                <div className="main-grid-item lg:col-span-7 h-full">
                    <ActivityLog />
                </div>
            </div>
        </div>
    );
}
