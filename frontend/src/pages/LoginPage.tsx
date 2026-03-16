import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleMockLogin = () => {
        // Since there are no environment keys added yet, bypassing directly to Setup
        navigate('/setup');
    };

    return (
        <div className="flex h-screen items-center justify-center p-4 bg-neutral-950">
            <div className="w-full max-w-md space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
                <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Login to Ente Bot</h1>
                <p className="text-sm text-neutral-400">Sign in with Google to manage your AI WhatsApp Bot.</p>
                <button 
                    onClick={handleMockLogin}
                    className="w-full rounded-lg bg-white p-2 font-medium text-neutral-950 hover:bg-neutral-200 transition-colors"
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
