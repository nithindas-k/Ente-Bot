import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { Users, MessageSquare, AlertCircle, LayoutDashboard, Key, BookOpen } from "lucide-react";
import axios from "axios";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        status: "Disconnected",
        repliesToday: 0,
        activeContacts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/dashboard/stats");
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
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-visible">
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
                        className="h-10 px-4 rounded-xl border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold text-xs"
                    >
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                        API Setup
                    </Button>
                    <Button 
                        onClick={() => navigate('/how-to-use')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 h-10 text-xs font-bold rounded-xl flex items-center space-x-1.5 border-0 group"
                    >
                        <BookOpen className="w-4 h-4 mr-0.5" />
                        <span>How to Enable</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Status</CardTitle>
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${stats.status === "Connected" ? "text-emerald-500" : "text-red-500"}`}>
                            {stats.status}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Replies Today</CardTitle>
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.repliesToday} / 150</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-1.5">
                        <CardTitle className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active Contacts</CardTitle>
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.activeContacts}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <QRScanner />
                </div>
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Live Activity Log</h3>
                    <div className="space-y-2 text-sm text-neutral-400">
                        <p>[12:00:00] Initializing system...</p>
                        <p>[12:00:05] Waiting for WhatsApp connection...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
