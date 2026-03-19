import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Settings, ShieldCheck, ShieldAlert, Search, Users, Filter, Bot, Loader2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API_BASE_URL } from "@/config/api.config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Contact {
    _id: string;
    name: string;
    phoneNumber: string;
    botEnabled: boolean;
    personalityId?: string;
}

function ContactCard({ contact, onToggle, onClickSettings }: { contact: Contact, onToggle: () => void, onClickSettings: () => void }) {
    const [dp, setDp] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/contacts/dp/${contact.phoneNumber}`)
            .then(res => setDp(res.data.url))
            .catch(() => { });
    }, [contact.phoneNumber]);

    const initials = (contact.name || "U").substring(0, 2).toUpperCase();

    useGSAP(() => {
        if (cardRef.current) {
            const el = cardRef.current;
            el.addEventListener("mouseenter", () => {
                gsap.to(el, { y: -5, scale: 1.02, duration: 0.3, ease: "power2.out", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(el, { y: 0, scale: 1, duration: 0.3, ease: "power2.out", boxShadow: "none" });
            });
        }
    }, { scope: cardRef });

    return (
        <div ref={cardRef} className="contact-card bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between transition-colors group">
            <div className="flex items-center space-x-4 w-full mb-6">
                {dp ? (
                    <img src={dp} alt={contact.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-800" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-500 shrink-0 border border-neutral-700">
                        {initials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-bold truncate leading-tight">{contact.name || "Unknown"}</h3>
                    <p className="text-neutral-500 text-xs truncate mt-1 tracking-wide">+{contact.phoneNumber}</p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <button
                    onClick={onToggle}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all active:scale-90 ${contact.botEnabled
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                        }`}
                >
                    {contact.botEnabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{contact.botEnabled ? 'Active' : 'Ignored'}</span>
                </button>
                <div className="flex items-center gap-2">
                    {contact.personalityId && (
                        <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center p-0" title="Custom Personality Assigned">
                            <Bot className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400 hover:text-white h-8 w-8 p-0 rounded-full bg-neutral-800/50 transition-all active:scale-90"
                        onClick={onClickSettings}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function ContactsPage() {
    const navigate = useNavigate();
    const container = useRef<HTMLDivElement>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "whitelisted" | "ignored">("all");
    const [filterPersonality, setFilterPersonality] = useState<"all" | "custom" | "default">("all");
    const [showFilters, setShowFilters] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [displayCount, setDisplayCount] = useState(30);

    const handleResync = async () => {
        setIsSyncing(true);
        const sid = localStorage.getItem('ente_bot_session_id') || 'default';
        try {
            toast.info("Starting synchronization...");
            await axios.post(`${API_BASE_URL}/api/contacts/sync`, { sessionId: sid });
            setTimeout(() => {
                fetchContacts();
                setIsSyncing(false);
                toast.success("Contacts updated!");
            }, 5000);
        } catch (error) {
            console.error("Sync failed", error);
            setIsSyncing(false);
            toast.error("Sync failed. Server might be low on RAM.");
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/contacts`);
            setContacts(response.data.contacts || []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const filteredContacts = useMemo(() => {
        return contacts.filter((contact) => {
            const name = (contact.name || "").toLowerCase();
            const phone = (contact.phoneNumber || "").toLowerCase();
            const search = searchTerm.toLowerCase();

            const matchesSearch = name.includes(search) || phone.includes(search);

            let matchesStatus = true;
            if (filterStatus === "whitelisted") matchesStatus = contact.botEnabled === true;
            if (filterStatus === "ignored") matchesStatus = contact.botEnabled === false;

            let matchesPersonality = true;
            if (filterPersonality === "custom") matchesPersonality = !!contact.personalityId;
            if (filterPersonality === "default") matchesPersonality = !contact.personalityId;

            return matchesSearch && matchesStatus && matchesPersonality;
        });
    }, [contacts, searchTerm, filterStatus, filterPersonality]);

    const displayedContacts = filteredContacts.slice(0, displayCount);
    const hasMore = displayCount < filteredContacts.length;

    const toggleWhitelist = async (id: string) => {
        try {
            await axios.post(`${API_BASE_URL}/api/contacts/${id}/toggle`);
            setContacts(prev => prev.map(c => c._id === id ? { ...c, botEnabled: !c.botEnabled } : c));
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to update status.");
        }
    };

    return (
        <div ref={container} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-500" />
                        Contacts
                    </h1>
                    <p className="text-neutral-400 text-xs max-w-sm leading-relaxed">
                        Control where your AI assistant responds. Only whitelisted numbers will get automatic replies.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleResync}
                        disabled={isSyncing}
                        className="h-10 px-4 rounded-xl border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold text-xs transition-all active:scale-95 group"
                    >
                        {isSyncing ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
                        )}
                        {isSyncing ? "Syncing..." : "Re-sync Contacts"}
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 h-auto text-xs font-bold rounded-xl flex items-center space-x-1.5 border-0 transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
                        <UserPlus className="w-4 h-4 mr-0.5" />
                        <span>Add Contact</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 flex items-center gap-3 w-full md:max-w-xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="Search contacts by name or number..."
                                className="pl-10 h-11 bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all font-sans w-full rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-4 border-neutral-800 transition-all rounded-xl active:scale-95 ${showFilters || filterStatus !== 'all' || filterPersonality !== 'all' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/50' : 'bg-neutral-900/50 text-neutral-400 hover:text-white'}`}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                            {(filterStatus !== 'all' || filterPersonality !== 'all') && (
                                <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500"></span>
                            )}
                        </Button>
                    </div>
                    <div className="text-xs text-neutral-500 font-medium shrink-0 pt-2 md:pt-0">
                        Showing {filteredContacts.length} of {contacts.length} contacts
                    </div>
                </div>

                {showFilters && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-6 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Bot Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'whitelisted', 'ignored'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border active:scale-95 ${filterStatus === status
                                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/20'
                                                : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5" /> AI Personality
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: 'all', label: 'All' },
                                    { id: 'custom', label: 'Custom Trained' },
                                    { id: 'default', label: 'Default Global' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setFilterPersonality(p.id as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border active:scale-95 ${filterPersonality === p.id
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/20'
                                                : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(filterStatus !== 'all' || filterPersonality !== 'all' || searchTerm) && (
                            <div className="ml-auto flex items-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFilterStatus('all');
                                        setFilterPersonality('all');
                                        setSearchTerm('');
                                    }}
                                    className="text-neutral-500 hover:text-white hover:bg-neutral-800 text-xs h-8 rounded-lg"
                                >
                                    Clear Rules
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-neutral-500 font-medium">Loading your contacts brain...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center">
                        <Users className="w-8 h-8 text-neutral-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-white font-bold">No contacts found</p>
                        <p className="text-neutral-500 text-xs">Try adjusting your filters or search term.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedContacts.map((contact) => (
                            <ContactCard
                                key={contact._id}
                                contact={contact}
                                onToggle={() => toggleWhitelist(contact._id)}
                                onClickSettings={() => navigate(`/personality/${contact._id}`)}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={() => setDisplayCount(prev => prev + 30)}
                                className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold h-11 px-8 rounded-xl border border-neutral-700 transition-all active:scale-95"
                            >
                                Load More Contacts ({filteredContacts.length - displayCount} left)
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
