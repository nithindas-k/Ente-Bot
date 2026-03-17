import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings, ShieldCheck, ShieldAlert, Search, Users, Filter, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Contact {
    _id: string;
    name: string;
    phoneNumber: string;
    botEnabled: boolean;
    personalityId?: string;
}

function ContactCard({ contact, onToggle, onClickSettings }: { contact: Contact, onToggle: () => void, onClickSettings: () => void }) {
    const [dp, setDp] = useState<string | null>(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/contacts/dp/${contact.phoneNumber}`)
            .then(res => setDp(res.data.url))
            .catch(() => {});
    }, [contact.phoneNumber]);

    const initials = (contact.name || "U").substring(0, 2).toUpperCase();

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-all group hover:shadow-lg hover:shadow-black/50">
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
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                        contact.botEnabled 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                    }`}
                >
                    {contact.botEnabled ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>{contact.botEnabled ? 'Active' : 'Ignored'}</span>
                </button>
                <div className="flex items-center gap-2">
                     {contact.personalityId && (
                         <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center" title="Custom Personality Assigned">
                             <Bot className="w-3.5 h-3.5 text-blue-500" />
                         </div>
                     )}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-neutral-400 hover:text-white h-8 w-8 p-0 rounded-full bg-neutral-800/50"
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
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "whitelisted" | "ignored">("all");
    const [filterPersonality, setFilterPersonality] = useState<"all" | "custom" | "default">("all");
    const [showFilters, setShowFilters] = useState(false);

    const fetchContacts = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/contacts");
            setContacts(response.data.contacts);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const toggleWhitelist = async (id: string) => {
        try {
            await axios.post(`http://localhost:5000/api/contacts/${id}/toggle`);
            fetchContacts(); // Refresh
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const filteredContacts = contacts.filter((contact) => {
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
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
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 h-auto text-xs font-bold rounded-xl flex items-center space-x-1.5 border-0">
                    <UserPlus className="w-4 h-4 mr-0.5" />
                    <span>Add Contact</span>
                </Button>
            </div>

            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 flex items-center gap-3 w-full md:max-w-xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                            <Input 
                                placeholder="Search contacts by name or number..." 
                                className="pl-10 h-11 bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all font-sans w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-11 px-4 border-neutral-800 transition-colors ${showFilters || filterStatus !== 'all' || filterPersonality !== 'all' ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/50' : 'bg-neutral-900/50 text-neutral-400 hover:text-white'}`}
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

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-6 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Bot Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'whitelisted', 'ignored'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status as any)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border ${
                                            filterStatus === status 
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                            filterPersonality === p.id 
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
                                    className="text-neutral-500 hover:text-white hover:bg-neutral-800 text-xs h-8"
                                >
                                    Clear Rules
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full">
                {loading ? (
                    <div className="text-center py-12 text-neutral-500 w-full col-span-full">Loading contacts...</div>
                ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-2xl col-span-full">
                        {searchTerm ? (
                            <div className="space-y-2">
                                <div className="text-lg font-medium text-neutral-400">No matching contacts</div>
                                <div className="text-sm text-neutral-500">Try adjusting your filters or search term.</div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-lg font-medium text-neutral-400">No contacts found</div>
                                <div className="text-sm text-neutral-500">Wait for messages to arrive or manually add someone!</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredContacts.map(contact => (
                            <ContactCard 
                                key={contact._id} 
                                contact={contact} 
                                onToggle={() => toggleWhitelist(contact._id)} 
                                onClickSettings={() => navigate(`/personality/${contact._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
