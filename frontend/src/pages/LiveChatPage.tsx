export default function LiveChatPage() {
    return (
        <div className="flex h-screen bg-neutral-950 text-white font-sans">
            {/* Sidebar */}
            <div className="w-80 border-r border-neutral-800 flex flex-col">
                <div className="p-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold">Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 cursor-pointer hover:bg-neutral-800/50 transition-colors">
                        <div className="font-medium">John Doe</div>
                        <div className="text-xs text-neutral-400 truncate">Last message from AI bot...</div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">John Doe</h2>
                        <span className="text-xs text-emerald-500 flex items-center space-x-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span>AI Active</span>
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="flex flex-col space-y-2">
                        <div className="max-w-[70%] bg-neutral-800 p-3 rounded-2xl rounded-bl-none self-start">
                            <p className="text-sm">Hello! How are you?</p>
                        </div>
                        <span className="text-xs text-neutral-500 self-start">12:00 PM</span>
                    </div>

                    <div className="flex flex-col space-y-2 self-end">
                        <div className="max-w-[70%] bg-emerald-600 p-3 rounded-2xl rounded-br-none text-white">
                            <p className="text-sm">I am doing great! Thanks for asking.</p>
                        </div>
                        <span className="text-xs text-neutral-500 self-end">12:01 PM</span>
                    </div>
                </div>

                <div className="p-4 border-t border-neutral-800 flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="Type a message (intercept AI)..."
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-emerald-500"
                    />
                    <button className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
