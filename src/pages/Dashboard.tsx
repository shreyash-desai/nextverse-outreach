import { useDashboardData } from '../hooks/useDashboardData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, Phone, CheckCircle, Plus } from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { stats, todaysFollowUps, activities, pipeline, isLoading } = useDashboardData();
  const navigate = useNavigate();

  const handleComplete = async (id: string) => {
    await followUpService.completeFollowUp(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-textSecondary text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 md:pb-10">
      
      {/* Hero */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-semibold text-textPrimary tracking-tight">
            Good {getGreeting()}, Shreyash
          </h1>
          <p className="text-textSecondary mt-0.5 text-[13px] md:text-[15px]">
            Your Goa outreach at a glance.
          </p>
        </div>
        <Button onClick={() => navigate('/leads')} className="rounded-2xl shrink-0 h-10 md:h-11 px-4 md:px-5 shadow-sm text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Lead
        </Button>
      </div>

      {/* Metrics — 2 cols on mobile, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, accent: false },
          { label: 'Contacted', value: stats.contacted, accent: false },
          { label: 'Interested', value: stats.interested, accent: false },
          { label: "Today's Follow-ups", value: todaysFollowUps.length, accent: false },
          { label: 'Converted', value: stats.converted, accent: true },
        ].map((m) => (
          <Card key={m.label} className="p-4 flex flex-col justify-center">
            <p className="text-[11px] md:text-sm font-medium text-textSecondary mb-1 leading-tight">{m.label}</p>
            <p className={`text-2xl font-semibold ${m.accent ? 'text-primary' : 'text-textPrimary'}`}>{m.value}</p>
          </Card>
        ))}
      </div>

      {/* Pipeline — horizontal scroll on all sizes */}
      <section>
        <h2 className="text-base md:text-lg font-semibold text-textPrimary mb-3">Pipeline</h2>
        <Card className="p-1">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { label: 'New', count: pipeline.new, color: 'bg-gray-100 text-gray-700' },
              { label: 'Contacted', count: pipeline.contacted, color: 'bg-blue-50 text-blue-700' },
              { label: 'Replied', count: pipeline.replied, color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Interested', count: pipeline.interested, color: 'bg-purple-50 text-purple-700' },
              { label: 'Demo', count: pipeline.demo, color: 'bg-amber-50 text-amber-700' },
              { label: 'Negotiation', count: pipeline.negotiation, color: 'bg-orange-50 text-orange-700' },
              { label: 'Converted', count: pipeline.converted, color: 'bg-emerald-50 text-emerald-700' },
            ].map((stage) => (
              <div key={stage.label} className="min-w-[90px] flex-1 p-3 text-center">
                <div className="text-[11px] font-medium text-textSecondary mb-2 truncate">{stage.label}</div>
                <div className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-sm font-semibold ${stage.color}`}>
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Split: Follow-ups + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section>
          <h2 className="text-base md:text-lg font-semibold text-textPrimary mb-3">Today's Follow-ups</h2>
          <div className="space-y-3">
            {todaysFollowUps.length === 0 ? (
              <Card className="p-6 text-center text-textSecondary border-dashed text-sm">
                No follow-ups scheduled for today. 🎉
              </Card>
            ) : (
              todaysFollowUps.map(f => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/leads/${f.leadId}`)}>
                      <h3 className="font-semibold text-textPrimary text-[14px] truncate">{f.leadName}</h3>
                      <p className="text-xs text-textSecondary mt-0.5">with {f.contactPerson}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-medium text-textMuted">
                        <span className="bg-light px-2 py-0.5 rounded-md">{f.type}</span>
                        <span>{new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {f.type === 'WhatsApp' && (
                        <button className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-emerald-600" onClick={() => window.open(`https://wa.me/${f.whatsapp}`, '_blank')}>
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      {f.type === 'Call' && (
                        <button className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-blue-600" onClick={() => window.location.href = `tel:${f.phone}`}>
                          <Phone className="w-4 h-4" />
                        </button>
                      )}
                      <button className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-textMuted hover:text-emerald-600" onClick={() => handleComplete(f.id)}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base md:text-lg font-semibold text-textPrimary mb-3">Recent Activity</h2>
          <Card className="p-4 md:p-5">
            <div className="space-y-5">
              {activities.map((activity, i) => (
                <div key={activity.id} className="relative pl-5">
                  {i !== activities.length - 1 && (
                    <div className="absolute left-1 top-5 bottom-[-20px] w-[2px] bg-border" />
                  )}
                  <div className="absolute left-[-1px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-light" />
                  <p className="text-[13px] text-textPrimary">
                    <span className="font-medium">{activity.performedBy}</span>{' '}
                    {activity.description.toLowerCase()} for{' '}
                    <span className="font-medium">{activity.leadName}</span>
                  </p>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-textSecondary text-center py-4">No recent activity.</p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
