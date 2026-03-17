import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-hidden relative">
                <Table className="text-white">
                    <TableHeader className="border-b border-neutral-800">
                        <TableRow>
                            <TableHead className="text-neutral-400">Name</TableHead>
                            <TableHead className="text-neutral-400">Phone</TableHead>
                            <TableHead className="text-neutral-400">Bot Status</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-neutral-500">Loading contacts...</TableCell>
                             </TableRow>
                        ) : filteredContacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-neutral-500">
                                    {searchTerm ? (
                                        <div className="space-y-2">
                                            <div className="text-lg font-medium text-neutral-400">No matching contacts</div>
                                            <div className="text-sm">Try searching for a different name or number.</div>
                                        </div>
                                    ) : (
                                        "No contacts found. Whitelist someone to start!"
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : filteredContacts.map((contact) => (
                            <TableRow key={contact._id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                <TableCell className="font-medium">{contact.name || "Unknown"}</TableCell>
                                <TableCell>{contact.phoneNumber}</TableCell>
                                <TableCell>
                                    <button 
                                        onClick={() => toggleWhitelist(contact._id)}
                                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                                            contact.botEnabled 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                                        }`}
                                    >
                                        {contact.botEnabled ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                        <span>{contact.botEnabled ? 'Whitelisted' : 'Ignored'}</span>
                                    </button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-neutral-400 hover:text-white"
                                        onClick={() => navigate(`/personality/${contact._id}`)}
                                    >
                                        <Settings className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
