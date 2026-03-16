import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, BrainCircuit, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import { FileUpload } from "@/components/FileUpload";

export default function PersonalityPage() {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [chatSample, setChatSample] = useState("");
    const [isTraining, setIsTraining] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastTrained, setLastTrained] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonality = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/personalities/${contactId}`);
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`http://localhost:5000/api/personalities/${contactId}`, { systemPrompt: prompt });
            alert("Instructions saved successfully!");
        } catch (error) {
            console.error("Error saving prompt:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleTrain = async () => {
        if (!chatSample.trim()) return alert("Please upload or paste some chat samples first.");
        setIsTraining(true);
        try {
            const response = await axios.post(`http://localhost:5000/api/personalities/${contactId}/train`, { rawChat: chatSample });
            setPrompt(response.data.personality.systemPrompt);
            setLastTrained(response.data.personality.trainedAt);
            alert("AI has analyzed the style and updated the instructions!");
        } catch (error) {
            console.error("Error training AI:", error);
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="p-8 space-y-6 bg-neutral-950 min-h-screen text-white font-sans">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/contacts")} className="text-neutral-400">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Personality Editor</h1>
                    <p className="text-neutral-400 text-sm">Fine-tune how your bot speaks to this specific contact.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Editor */}
                <Card className="bg-neutral-900 border-neutral-800 text-white shadow-xl shadow-black/50">
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
                            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-4 text-sm text-white focus:outline-emerald-500 transition-all resize-none"
                        />
                        <Button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-2 h-11 shadow-lg shadow-emerald-900/20"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{isSaving ? "Saving..." : "Save Instructions"}</span>
                        </Button>
                    </CardContent>
                </Card>

                {/* AI Trainer */}
                <Card className="bg-neutral-900 border-emerald-900/30 bg-gradient-to-br from-neutral-900 to-emerald-950/20 text-white shadow-xl shadow-emerald-900/10">
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
                                className="w-full rounded-lg bg-neutral-950/50 border border-emerald-900/20 p-4 text-sm text-neutral-300 focus:outline-emerald-500 transition-all font-mono resize-none"
                            />
                            
                            <Button 
                                onClick={handleTrain}
                                disabled={isTraining}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center space-x-2 h-11"
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
