import { useState, useEffect } from 'react';
import { followUpService } from '../services/followUpService';
import type { FollowUp } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, Phone, CheckCircle, Calendar, AlertCircle } from 'lucide-react';
import { isToday, isPast, isFuture } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const navigate = useNavigate();

  const loadData = async () => {
    const data = await followUpService.getFollowUps();
    setFollowUps(data.filter(f => !f.completed));
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
    <Card className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-primary'}`}>
      <div className="flex-1 cursor-pointer" onClick={() => navigate(`/leads/${f.leadId}`)}>
        <h3 className="font-semibold text-textPrimary text-[15px]">{f.leadName}</h3>
        <p className="text-sm text-textSecondary mb-1">Follow up with {f.contactPerson}</p>
        <p className="text-sm text-textPrimary mb-2">{f.notes}</p>
        <div className="flex items-center gap-2 text-xs font-medium text-textMuted">
          <span className="bg-light px-2 py-1 rounded-md">{f.type}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(f.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOverdue && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue</span>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {f.type === 'WhatsApp' && (
          <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${f.whatsapp}`, '_blank'); }}>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </Button>
        )}
        {f.type === 'Call' && (
          <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${f.phone}`; }}>
            <Phone className="w-4 h-4 text-blue-600" />
          </Button>
        )}
        <Button variant="secondary" size="icon" onClick={(e) => { e.stopPropagation(); handleComplete(f.id); }}>
          <CheckCircle className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-4xl">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Follow-ups</h1>
        <p className="text-textSecondary mt-1 text-[15px]">Manage your scheduled outreach tasks.</p>
      </div>

      <div className="space-y-6">
        {overdue.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Overdue
            </h2>
            <div className="space-y-3">
              {overdue.map(f => <TaskCard key={f.id} f={f} isOverdue />)}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Today</h2>
          <div className="space-y-3">
            {today.length === 0 ? (
              <Card className="p-8 text-center text-textSecondary border-dashed">
                You're all caught up for today!
              </Card>
            ) : (
              today.map(f => <TaskCard key={f.id} f={f} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.length === 0 ? (
              <Card className="p-8 text-center text-textSecondary border-dashed">
                No upcoming follow-ups scheduled.
              </Card>
            ) : (
              upcoming.map(f => <TaskCard key={f.id} f={f} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
