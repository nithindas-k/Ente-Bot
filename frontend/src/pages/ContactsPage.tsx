import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings } from "lucide-react";


const contacts = [
    { id: 1, name: "John Doe", phone: "+1234567890", status: "Whitelisted", personality: "Trained" },
    { id: 2, name: "Jane Smith", phone: "+1987654321", status: "Ignored", personality: "Default" },
];

export default function ContactsPage() {
    return (
        <div className="p-8 space-y-6 bg-neutral-950 min-h-screen text-white font-sans">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-neutral-400 text-sm">Manage who your AI bot talks to and their tone.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Whitelist Contact</span>
                </Button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <Table className="text-white">
                    <TableHeader className="border-b border-neutral-800">
                        <TableRow>
                            <TableHead className="text-neutral-400">Name</TableHead>
                            <TableHead className="text-neutral-400">Phone</TableHead>
                            <TableHead className="text-neutral-400">Status</TableHead>
                            <TableHead className="text-neutral-400">Personality</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contact.status === 'Whitelisted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                        {contact.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contact.personality === 'Trained' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                        {contact.personality}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
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
