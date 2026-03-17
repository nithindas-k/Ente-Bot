import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Contacts", icon: Users, path: "/contacts" },
  { name: "Settings", icon: Settings, path: "/setup" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [account, setAccount] = useState<{name: string, phone: string, initials: string} | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/auth/status");
            if (res.data?.status === 'connected' && res.data?.account) {
                setIsConnected(true);
                setAccount(res.data.account);
            } else {
                setIsConnected(false);
                setAccount(null);
            }
        } catch (e) {
            console.error("Failed to fetch WhatsApp account info for sidebar", e);
        }
    };

    fetchAccount();
    const interval = setInterval(fetchAccount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-900 flex flex-col transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="p-5 flex items-center justify-between border-b border-neutral-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white shrink-0" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Ente Bot</h1>
              <p className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">AI Companion</p>
            </div>
          </div>
          
          {/* Close button for mobile inside sidebar */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-neutral-400 hover:text-white h-8 w-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 py-1.5 text-[9px] font-semibold text-neutral-500 uppercase tracking-widest">General</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 group border border-transparent",
                  isActive
                    ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-transform group-hover:scale-110",
                  isActive ? "text-emerald-500" : "text-neutral-500 group-hover:text-white"
                )} />
                <span className="font-medium text-[13px]">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 bg-emerald-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-900 space-y-3">
          <div className="px-3 py-2 bg-neutral-900/50 rounded-xl flex items-center space-x-2.5 border border-neutral-800">
            <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border",
                isConnected ? "bg-neutral-800 text-emerald-500 border-emerald-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700"
            )}>
              {account ? account.initials : 'WB'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate text-white">{account ? account.name : 'WhatsApp Bot'}</p>
              <p className="text-[9px] text-neutral-500 truncate uppercase tracking-tighter">
                {account ? `+${account.phone}` : 'Not Connected'}
              </p>
            </div>
            <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-neutral-600")} />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-neutral-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg group transition-all h-9 px-3"
              >
                <LogOut className="w-4 h-4 mr-2.5 group-hover:translate-x-1 transition-transform" />
                <span className="font-medium text-[13px]">Sign Out</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-neutral-900 bg-neutral-950">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Heads up!</AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-400">
                  Are you sure you want to sign out? This will clear your current local session data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await axios.post("http://localhost:5000/api/auth/logout");
                    } catch (e) {
                      console.error("Logout API failed", e);
                    }
                    localStorage.clear();
                    window.location.href = "/login";
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
    </>
  );
}
