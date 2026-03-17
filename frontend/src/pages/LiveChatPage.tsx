import { useState } from "react";
import { MessageSquare, Send, Circle, Search, Paperclip, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LiveChatPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="h-[calc(100vh-80px)] flex gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Contact List Sidebar Section */}
            <div className="w-96 hidden md:flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800 space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-emerald-500" />
                        Conversations
                    </h2>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-500 transition-all" />
                        <Input 
                            placeholder="Search chats..." 
                            className="pl-10 h-11 bg-neutral-950/50 border-neutral-800 focus:ring-emerald-500/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* Active Chat Item */}
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl cursor-pointer group transition-all relative">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-emerald-500 border border-emerald-500/30">
                                JD
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="font-bold text-white truncate">John Doe</h3>
                                    <span className="text-[10px] text-neutral-500">12:45 PM</span>
                                </div>
                                <p className="text-xs text-neutral-400 truncate group-hover:text-neutral-300">Nthendaa da! Saapdaan poyitt varam...</p>
                            </div>
                        </div>
                        <div className="absolute right-3 bottom-4">
                            <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                        </div>
                    </div>

                    {/* Dummy Chat Item */}
                    <div className="p-4 hover:bg-neutral-800/50 rounded-2xl cursor-pointer group transition-all border border-transparent">
                        <div className="flex items-center space-x-3 opacity-60">
                            <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-neutral-400">
                                RK
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="font-bold text-neutral-300 truncate">Rahul Krishna</h3>
                                    <span className="text-[10px] text-neutral-600">Yesterday</span>
                                </div>
                                <p className="text-xs text-neutral-500 truncate">Sanam settyo?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden relative">
                {/* Chat Mesh background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                        <path d="M 4 0 L 0 0 0 4" fill="none" stroke="white" strokeWidth="0.1" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Header */}
                <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80 backdrop-blur-md relative z-10">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center font-bold text-emerald-500 border border-emerald-500/20">
                            JD
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">John Doe</h2>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                AI Active (Manglish)
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white rounded-full">
                            <Search className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white rounded-full">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10">
                    {/* Received */}
                    <div className="flex flex-col space-y-2 group items-start">
                        <div className="max-w-[80%] bg-neutral-800/80 backdrop-blur-sm p-4 rounded-3xl rounded-bl-none text-white border border-neutral-700/50">
                            <p className="text-sm leading-relaxed">Nthendaa da! Saapdaan poyitt varam...</p>
                        </div>
                        <span className="text-[10px] text-neutral-500 ml-2">12:45 PM</span>
                    </div>

                    {/* AI Resp (Sent) */}
                    <div className="flex flex-col space-y-2 group items-end">
                        <div className="max-w-[80%] bg-emerald-600 p-4 rounded-3xl rounded-br-none text-white border border-emerald-500/20">
                            <p className="text-sm leading-relaxed">Sheri da, veg am vaa. Njan evide und!</p>
                        </div>
                        <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[10px] text-emerald-500 font-bold">AI Bot</span>
                            <span className="text-[10px] text-neutral-500">12:46 PM</span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800 relative z-10 flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-emerald-500 transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Intercept AI with a message..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-white placeholder:text-neutral-600"
                        />
                    </div>
                    <Button className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-0">
                        <Send className="w-6 h-6 mr-0.5 -mt-0.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
