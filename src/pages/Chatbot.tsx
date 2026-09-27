import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Send, Bot, User } from 'lucide-react';
import { leadService } from '../services/leadService';
import { followUpService } from '../services/followUpService';
import { getCurrentUserName } from '../utils/auth';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { FunctionDeclaration } from '@google/generative-ai';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello! I am your AI assistant powered by Gemini. I have access to your CRM data. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Fetch live CRM context
      const leads = await leadService.getLeads();
      const followUps = await followUpService.getFollowUps();
      const myName = getCurrentUserName();

      const crmContext = `
      Current User: ${myName}
      Total Leads: ${leads.length}
      Total Follow-ups: ${followUps.length}
      
      Leads Data summary:
      ${leads.map(l => `- ${l.resortName} (${l.status}, Assigned to: ${l.assignedTo})`).join('\n')}
      `;

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';

      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set. Please restart your dev server after adding it to .env.local");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const addMultipleLeadsDeclaration: FunctionDeclaration = {
        name: "add_multiple_leads",
        description: "Adds one or multiple new leads to the CRM database.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            leads: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  resortName: { type: SchemaType.STRING },
                  contactPerson: { type: SchemaType.STRING },
                  phone: { type: SchemaType.STRING },
                  email: { type: SchemaType.STRING },
                  website: { type: SchemaType.STRING },
                  whatsapp: { type: SchemaType.STRING },
                  notes: { type: SchemaType.STRING, description: "Combine all other information, such as Meta ads, OTA dependency, custom pitch, etc." }
                },
                required: ["resortName", "phone"]
              }
            }
          },
          required: ["leads"]
        }
      };

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "You are an AI assistant for the Nextverse Outreach CRM. You help the user manage leads and answer questions. If the user provides information about leads (like a list of resorts), use the add_multiple_leads tool to insert them into the CRM. Extract all extra details like OTA dependency, Meta Ads, and pitches into the 'notes' field.",
        tools: [{ functionDeclarations: [addMultipleLeadsDeclaration] }],
      });

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: `CRM CONTEXT:\n${crmContext}` }] },
          { role: 'model', parts: [{ text: 'Context loaded. Ready to help.' }] }
        ]
      });

      const result = await chat.sendMessage(userMessage);
      const call = result.response.functionCalls()?.[0];
      
      let botResponse = result.response.text() || "I processed your request, but have no text response.";

      if (call && call.name === 'add_multiple_leads') {
        const args = call.args as any;
        const leadsToAdd = args.leads || [];
        let addedCount = 0;
        for (const leadData of leadsToAdd) {
          await leadService.createLead({
            resortName: leadData.resortName || 'Unknown Resort',
            contactPerson: leadData.contactPerson || 'Unknown',
            phone: leadData.phone || '0000000000',
            email: leadData.email || '',
            website: leadData.website || '',
            whatsapp: leadData.whatsapp || leadData.phone || '',
            notes: leadData.notes || '',
            designation: 'Owner/Manager',
            location: 'Goa',
            source: 'AI Assistant',
            assignedTo: myName,
            status: 'New',
            interest: 'Unknown',
            reaction: 'Other',
            score: 50,
            contactMethod: 'WhatsApp',
            firstContactDate: null,
            lastContactDate: null,
            nextFollowUpDate: null,
            followUpType: 'None',
            followUpNotes: '',
            intelligence: {
              category: 'Other',
              propertySize: 'Unknown',
              whatsappUsage: 'Unknown',
              currentAutomation: 'None',
              potentialNeeds: []
            }
          });
          addedCount++;
        }
        botResponse = `✅ Successfully added **${addedCount}** leads to your CRM! You can view them in the Leads tab.`;
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: botResponse }]);

    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-40px)] flex flex-col pt-4 pb-20 md:pb-0">
      <div className="mb-4">
        <h1 className="text-[22px] md:text-[28px] font-semibold text-textPrimary tracking-tight">AI Assistant</h1>
        <p className="text-textSecondary mt-0.5 text-[13px] md:text-[15px]">Powered by Gemini 1.5 Flash 8B</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-surface/50 border border-primary/20 shadow-lg shadow-primary/5">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-purple-100 text-purple-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-border shadow-sm rounded-bl-sm text-textPrimary'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-600">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm bg-white border border-border shadow-sm rounded-bl-sm text-textPrimary flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-white border-t border-border">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              name="message" 
              placeholder="Ask me anything about your leads..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 mb-0" 
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="w-12 h-[42px] px-0 flex justify-center mt-[22px]">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
