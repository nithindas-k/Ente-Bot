import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function PersonalityPage() {
    return (
        <div className="p-8 space-y-6 bg-neutral-950 min-h-screen text-white font-sans">
            <h1 className="text-3xl font-bold tracking-tight">Personality Editor</h1>
            <p className="text-neutral-400 text-sm">Fine-tune the AI response instructions and behaviour prompts.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">System Instructions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea 
                            rows={8} 
                            defaultValue="You are a helpful assistant assisting the user to manage their schedule. Be polite and concise."
                            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-3 text-sm text-white focus:outline-emerald-500"
                        />
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-2">
                            <Save className="w-4 h-4" />
                            <span>Save Prompt</span>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Tone Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-4">
                            <li>Concise and friendly responses.</li>
                            <li>Avoids technical jargon where possible.</li>
                            <li>Asks clarifying questions when schedule is full.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
