import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { supabase } from '../config/supabase';
import { isAdmin } from '../utils/auth';
import { Bot, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
  id: string;
  user_email: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export function AILogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin()) {
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textMuted">You do not have permission to view AI logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary tracking-tight">AI Audit Logs</h1>
          <p className="text-textSecondary mt-1">Monitor how your team is using the AI Chatbot to manage leads.</p>
        </div>
      </div>

      <Card className="bg-surface overflow-hidden border border-border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-textMuted">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-textMuted">No AI chat logs found.</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-purple-100 text-purple-600'}`}>
                    {log.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-textPrimary truncate">
                        {log.role === 'user' ? log.user_email : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-textMuted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="text-sm text-textSecondary whitespace-pre-wrap bg-white border border-border rounded-lg p-3 shadow-sm inline-block max-w-full">
                      {log.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
