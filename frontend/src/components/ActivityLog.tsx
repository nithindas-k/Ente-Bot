import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, CheckCircle2, Terminal } from 'lucide-react';
import { useWhatsApp, type SyncLog } from '@/context/WhatsAppContext';
import { cn } from '@/lib/utils';

export const ActivityLog: React.FC = () => {
    const { syncLogs, syncProgress, status } = useWhatsApp();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Group logs to avoid repetitive "Syncing contacts: X/Y" lines
    const processedLogs = useMemo(() => {
        const result: SyncLog[] = [];
        let foundSyncLine = false;

        for (const log of syncLogs) {
            const isSyncUpdate = log.message.startsWith('Syncing contacts');
            if (isSyncUpdate) {
                if (!foundSyncLine) {
                    result.push(log);
                    foundSyncLine = true;
                }
            } else {
                result.push(log);
            }
        }
        return result;
    }, [syncLogs]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [processedLogs]);

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[400px]">
            {/* Minimal Header matching Dashboard cards */}
            <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-white tracking-tight">System Activity</h3>
                </div>
                {syncProgress > 0 && (
                    <div className="flex items-center gap-2">
                        {syncProgress < 100 ? (
                            <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Syncing {syncProgress}%
                            </span>
                        ) : (
                            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Ready
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Micro Progress Bar */}
            {syncProgress > 0 && syncProgress < 100 && (
                <div className="h-[1px] w-full bg-neutral-800 relative">
                    <motion.div 
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${syncProgress}%` }}
                    />
                </div>
            )}

            {/* Simplified Logs List */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <AnimatePresence initial={false}>
                    {processedLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-700 opacity-50">
                            <Clock className="w-8 h-8 mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Listening...</p>
                        </div>
                    ) : (
                        processedLogs.map((log: SyncLog, index: number) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: index === 0 ? 1 : 0.4 }}
                                className="relative pl-5 border-l border-neutral-800"
                            >
                                {/* Minimal Dot */}
                                <div className={cn(
                                    "absolute left-[-3px] top-1.5 w-1.5 h-1.5 rounded-full",
                                    index === 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-neutral-800"
                                )} />

                                <div className="flex items-center justify-between gap-4">
                                    <span className={cn(
                                        "text-xs font-medium",
                                        index === 0 ? "text-neutral-200" : "text-neutral-500"
                                    )}>
                                        {log.message}
                                    </span>
                                    <span className="text-[9px] text-neutral-600 font-mono">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Minimal Footer */}
            <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        status.status === 'connected' ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                        {status.status === 'connected' ? 'Connected' : 'Waiting'}
                    </span>
                </div>
                <div className="text-[9px] text-neutral-700 font-mono">
                    SID: {useWhatsApp().sessionId.slice(0, 8)}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 0px; }
            `}} />
        </div>
    );
};
