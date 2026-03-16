import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRScanner from "@/components/QRScanner";
import { Users, MessageSquare, Play, AlertCircle } from "lucide-react";
import axios from "axios";

export default function DashboardPage() {
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
        <div className="p-8 space-y-6 bg-neutral-950 min-h-screen text-white font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-neutral-400 text-sm">Overview of your AI Bot activity.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Bot</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Status</CardTitle>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.status === "Connected" ? "text-emerald-500" : "text-red-500"}`}>
                            {stats.status}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Replies Today</CardTitle>
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.repliesToday} / 150</div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Active Contacts</CardTitle>
                        <Users className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeContacts}</div>
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
