import { useState, useEffect, useRef } from "react";
import { toast } from 'sonner';
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, BrainCircuit, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api.config";
import { FileUpload } from "@/components/FileUpload";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function PersonalityPage() {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const container = useRef<HTMLDivElement>(null);
    const [prompt, setPrompt] = useState("");
    const [chatSample, setChatSample] = useState("");
    const [isTraining, setIsTraining] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastTrained, setLastTrained] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonality = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/personalities/${contactId}`);
                if (response.data.personality) {
                    setPrompt(response.data.personality.systemPrompt);
                    setChatSample(response.data.personality.rawChatSample || "");
                    setLastTrained(response.data.personality.trainedAt);
                }
            } catch (error) {
                console.error("Error fetching personality:", error);
            }
        };
        fetchPersonality();
    }, [contactId]);

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from(".page-header", { 
            opacity: 0, 
            x: -30, 
            duration: 0.8, 
            ease: "power3.out" 
        })
        .from(".personality-card", { 
            opacity: 0, 
            y: 30, 
            stagger: 0.2, 
            duration: 0.7, 
            ease: "back.out(1.4)" 
        }, "-=0.4");
    }, { scope: container });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/personalities/${contactId}`, { systemPrompt: prompt });
            toast.success("Instructions saved!");
        } catch (error) {
            console.error("Error saving prompt:", error);
            toast.error("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTrain = async () => {
        if (!chatSample.trim()) return toast.error("Please upload or paste some chat samples first.");
        setIsTraining(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/personalities/${contactId}/train`, { rawChat: chatSample });
            setPrompt(response.data.personality.systemPrompt);
            setLastTrained(response.data.personality.trainedAt);
            toast.success("AI brain trained successfully!");
        } catch (error) {
            console.error("Error training AI:", error);
            toast.error("Training failed.");
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div ref={container} className="space-y-10">
            <div className="page-header flex items-center space-x-6">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => navigate("/contacts")} 
                    className="w-12 h-12 rounded-2xl border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white transition-all active:scale-90"
                >
                    <ArrowLeft className="w-5 h-5 font-bold" />
                </Button>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-emerald-500" />
                        Personality Editor
                    </h1>
                    <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
                        Fine-tune exactly how your AI assistant speaks to this specific contact.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Editor */}
                <Card className="personality-card bg-neutral-900 border-neutral-800 text-white hover:border-neutral-700 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <span>System Instructions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea 
                            rows={12} 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. You are a helpful assistant. Keep replies short and use emojis."
                            className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 text-sm text-white focus:outline-emerald-500 transition-all resize-none shadow-inner"
                        />
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-2 h-12 rounded-xl active:scale-95 shadow-lg shadow-emerald-500/10"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isSaving ? "Saving..." : "Save Instructions"}</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* AI Trainer */}
                <Card className="personality-card bg-neutral-900 border-emerald-900/30 bg-gradient-to-br from-neutral-900 to-emerald-950/20 text-white hover:border-emerald-500/30 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2 text-emerald-400">
                            <BrainCircuit className="w-5 h-5" />
                            <span>AI Style Trainer</span>
                        </CardTitle>
                        <p className="text-xs text-neutral-500 mt-1">Upload a WhatsApp export or paste logs below for deep AI style analysis.</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Premium Upload Component */}
                        <FileUpload onFileSelect={(content) => setChatSample(content)} />

                        <div className="space-y-4">
                            <textarea 
                                rows={6} 
                                value={chatSample}
                                onChange={(e) => setChatSample(e.target.value)}
                                placeholder="Logs will appear here after upload, or you can paste them manually..."
                                className="w-full rounded-xl bg-neutral-950/50 border border-emerald-900/20 p-4 text-sm text-neutral-300 focus:outline-emerald-500 transition-all font-mono resize-none shadow-inner"
                            />
                            
                            <Button 
                                onClick={handleTrain}
                                disabled={isTraining}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center space-x-2 h-12 rounded-xl active:scale-95 transition-all"
                            >
                                {isTraining ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                                <span>{isTraining ? "Analyzing Personality..." : "Train from Chat History"}</span>
                            </Button>
                            
                            {lastTrained && (
                                <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 mt-2 italic">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    <span>Last trained: {new Date(lastTrained).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
