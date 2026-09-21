import { useState, useEffect } from 'react';
import { followUpService } from '../services/followUpService';
import type { FollowUp } from '../types';
import { Card } from '../components/ui/Card';
import { MessageCircle, Phone, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { isToday, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    const data = await followUpService.getFollowUps();
    setFollowUps(data.filter(f => !f.completed));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    const channel = supabase.channel('public:follow_ups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleComplete = async (id: string) => {
    await followUpService.completeFollowUp(id);
    loadData();
  };

  const overdue = followUps.filter(f => isPast(new Date(f.date)) && !isToday(new Date(f.date)));
  const today = followUps.filter(f => isToday(new Date(f.date)));
  const upcoming = followUps.filter(f => isFuture(new Date(f.date)) && !isToday(new Date(f.date)));

  const TaskCard = ({ f, isOverdue = false }: { f: FollowUp, isOverdue?: boolean }) => (
    <Card className={`p-4 border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-primary'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/leads/${f.leadId}`)}>
          <h3 className="font-semibold text-textPrimary text-[14px] truncate">{f.leadName}</h3>
          <p className="text-xs text-textSecondary mt-0.5">with {f.contactPerson}</p>
          {f.notes && <p className="text-xs text-textPrimary mt-1.5 line-clamp-2">{f.notes}</p>}
          <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-textMuted flex-wrap">
            <span className="bg-light px-2 py-0.5 rounded-md">{f.type}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(f.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOverdue && <span className="text-red-500 flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> Overdue</span>}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {f.type === 'WhatsApp' && (
            <button
              className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${f.whatsapp}`, '_blank'); }}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
          {f.type === 'Call' && (
            <button
              className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${f.phone}`; }}
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          <button
            className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-textMuted hover:text-emerald-600 hover:border-emerald-200 transition-colors"
            onClick={(e) => { e.stopPropagation(); handleComplete(f.id); }}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 md:pb-10">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Follow-ups</h1>
        <p className="text-textSecondary mt-0.5 text-[14px] md:text-[15px]">Manage your scheduled outreach tasks.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-textSecondary text-sm">Loading…</div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Overdue ({overdue.length})
              </h2>
              <div className="space-y-3">
                {overdue.map(f => <TaskCard key={f.id} f={f} isOverdue />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-base font-semibold text-textPrimary mb-3">Today ({today.length})</h2>
            <div className="space-y-3">
              {today.length === 0 ? (
                <Card className="p-6 text-center text-textSecondary border-dashed text-sm">
                  You're all caught up for today! 🎉
                </Card>
              ) : (
                today.map(f => <TaskCard key={f.id} f={f} />)
              )}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-textPrimary mb-3">Upcoming ({upcoming.length})</h2>
            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <Card className="p-6 text-center text-textSecondary border-dashed text-sm">
                  No upcoming follow-ups scheduled.
                </Card>
              ) : (
                upcoming.map(f => <TaskCard key={f.id} f={f} />)
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
