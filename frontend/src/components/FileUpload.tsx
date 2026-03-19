import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
    onFileSelect: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
            toast.error('Invalid file type. Please upload a .txt file.');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onFileSelect(content);
        };
        reader.readAsText(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!fileName ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center space-y-4 ${
                            isDragging 
                            ? 'border-emerald-500 bg-emerald-500/5 ring-4 ring-emerald-500/10' 
                            : 'border-neutral-800 bg-neutral-900/50 hover:border-emerald-500/50 hover:bg-neutral-800/50'
                        }`}
                    >
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept=".txt"
                            onChange={handleFileChange}
                        />
                        
                        <div className={`p-4 rounded-full transition-colors duration-300 ${
                            isDragging ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-neutral-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-500'
                        }`}>
                            <Upload className="w-6 h-6" />
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                                Drop your WhatsApp export here
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                or click to browse (supports .txt only)
                            </p>
                        </div>

                        {/* Animated background glow */}
                        <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 blur-xl transition-all duration-500 -z-10" />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white truncate max-w-[200px]">{fileName}</p>
                                <div className="flex items-center space-x-1 text-[10px] text-emerald-500/70">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Ready to train</span>
                                </div>
                            </div>
                        </div>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFileName(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-neutral-500 hover:text-white hover:bg-neutral-800"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
