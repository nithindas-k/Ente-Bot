import { Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="lg:hidden h-16 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-1">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight">Ente Bot</h1>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-neutral-400 hover:text-white"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6" />
      </Button>
    </header>
  );
}
