import { useNavigate } from 'react-router-dom';
import { Sparkles, Chrome, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleMockLogin = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex h-screen w-full items-center justify-center p-4 bg-neutral-950 font-sans relative overflow-hidden">
             {/* Dynamic background effects */}
             <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
             <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] rounded-full" />
             
             {/* Center Card */}
             <div className="w-full max-w-sm relative z-10 space-y-6 animate-in zoom-in-95 duration-700">
                <div className="text-center space-y-3">
                    <div className="inline-flex w-14 h-14 bg-emerald-600 rounded-2xl items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white uppercase italic">Ente Bot</h1>
                        <p className="text-emerald-500 text-[8px] font-bold uppercase tracking-[0.3em] font-mono">Your AI companion on WhatsApp</p>
                    </div>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-2xl border border-neutral-800 p-6 rounded-[1.5rem] space-y-5">
                    <div className="space-y-1.5 text-center pb-2">
                        <h2 className="text-lg font-bold text-white">Welcome Back</h2>
                        <p className="text-[11px] text-neutral-500">Sign in to manage your smart responders and chat history.</p>
                    </div>

                    <Button 
                        onClick={handleMockLogin}
                        className="w-full h-11 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] border-0 text-xs"
                    >
                        <Chrome className="w-4 h-4" />
                        <span>Continue with Google</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-1" />
                    </Button>

                    <div className="flex items-center justify-center space-x-2 text-[9px] text-neutral-600 font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>SECURE END-TO-END AUTHENTICATION</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-[0.2em]">
                        BY NITHIN DAS • v1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
