// src/components/layout/AIAssistant.tsx
import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
    Sheet,  SheetContent, SheetHeader,
    SheetTitle, SheetTrigger
} from "../ui/sheet";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { api } from "../../lib/api";
    

interface Message {
    role: 'user' | 'bot';
    text: string;
    data?: any[];
    format?: 'text' | 'table' | 'chart';
}

export const AIAssistant = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleAsk = async () => {
        if (!input.trim() || loading) return;

        const userPrompt = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userPrompt }]);
        setLoading(true);

        try {
            const response = await api.askAI(userPrompt);

            setMessages(prev => [...prev, {
                role: 'bot',
                text: response.answer,
                data: response.data,
                format: response.format
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "I encountered an error. Please try rephrasing your question."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:scale-110 transition-transform">
                        <Bot className="h-7 w-7 text-white" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-[90vw] sm:w-[500px] flex flex-col h-full">
                    <SheetHeader className="pb-4 border-b">
                        <SheetTitle className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            UDISE AI Assistant
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className="flex-1 pr-4">
                        <div className="flex flex-col gap-4 py-4">
                            {messages.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p className="text-sm">Ask me about PTR, enrollment, or school facilities.</p>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{m.text}</p>

                                        {/* Render Data Table */}
                                        {m.format === 'table' && m.data && m.data.length > 0 && (
                                            <div className="mt-3 border rounded-lg bg-background/50 overflow-hidden">
                                                <div className="max-h-[200px] overflow-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                {Object.keys(m.data[0]).map(key => (
                                                                    <TableHead key={key} className="h-8 text-[10px] px-2">{key}</TableHead>
                                                                ))}
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {m.data.map((row, idx) => (
                                                                <TableRow key={idx}>
                                                                    {Object.values(row).map((val: any, j) => (
                                                                        <TableCell key={j} className="py-1 px-2 text-[10px]">
                                                                            {String(val)}
                                                                        </TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    <div className="flex gap-2 pt-4 border-t mt-auto">
                        <Input
                            placeholder="Ask a question..."
                            value={input}
                            disabled={loading}
                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setInput(e.target.value)}
                            onKeyDown={(e: { key: string; }) => e.key === 'Enter' && handleAsk()}
                        />
                        <Button onClick={handleAsk} disabled={loading || !input.trim()} size="icon">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};