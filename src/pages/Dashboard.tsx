import { useDashboardData } from '../hooks/useDashboardData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, Phone, CheckCircle, Plus } from 'lucide-react';
import { followUpService } from '../services/followUpService';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { stats, todaysFollowUps, activities, pipeline } = useDashboardData();
  const navigate = useNavigate();

  const handleComplete = (id: string) => {
    followUpService.completeFollowUp(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">
            Good evening, Shreyash
          </h1>
          <p className="text-textSecondary mt-1 text-[15px]">
            Here's what's happening with your Goa outreach.
          </p>
        </div>
        <Button onClick={() => navigate('/leads')} className="rounded-2xl shrink-0 h-11 px-5 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 md:p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-textSecondary mb-1">Total Leads</p>
          <p className="text-2xl font-semibold text-textPrimary">{stats.total}</p>
        </Card>
        <Card className="p-4 md:p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-textSecondary mb-1">Contacted</p>
          <p className="text-2xl font-semibold text-textPrimary">{stats.contacted}</p>
        </Card>
        <Card className="p-4 md:p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-textSecondary mb-1">Interested</p>
          <p className="text-2xl font-semibold text-textPrimary">{stats.interested}</p>
        </Card>
        <Card className="p-4 md:p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-textSecondary mb-1">Follow-ups</p>
          <p className="text-2xl font-semibold text-textPrimary">{todaysFollowUps.length}</p>
        </Card>
        <Card className="p-4 md:p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-textSecondary mb-1">Converted</p>
          <p className="text-2xl font-semibold text-primary">{stats.converted}</p>
        </Card>
      </div>

      {/* Pipeline */}
      <section>
        <h2 className="text-lg font-semibold text-textPrimary mb-4">Pipeline</h2>
        <Card className="p-1 md:p-2">
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {[
              { label: 'New', count: pipeline.new, color: 'bg-gray-100 text-gray-700' },
              { label: 'Contacted', count: pipeline.contacted, color: 'bg-blue-50 text-blue-700' },
              { label: 'Replied', count: pipeline.replied, color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Interested', count: pipeline.interested, color: 'bg-purple-50 text-purple-700' },
              { label: 'Demo', count: pipeline.demo, color: 'bg-amber-50 text-amber-700' },
              { label: 'Negotiation', count: pipeline.negotiation, color: 'bg-orange-50 text-orange-700' },
              { label: 'Converted', count: pipeline.converted, color: 'bg-emerald-50 text-emerald-700' },
            ].map((stage, i) => (
              <div key={stage.label} className="min-w-[120px] flex-1 p-3 snap-start relative group">
                <div className="text-sm font-medium text-textSecondary mb-1.5 group-hover:text-textPrimary transition-colors">
                  {stage.label}
                </div>
                <div className={`inline-flex items-center justify-center h-8 px-3 rounded-full text-sm font-semibold ${stage.color}`}>
                  {stage.count}
                </div>
                {i < 6 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-4 border-t-2 border-dotted border-border" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Split Content */}
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Today's Follow-ups</h2>
          <div className="space-y-3">
            {todaysFollowUps.length === 0 ? (
              <Card className="p-6 text-center text-textSecondary border-dashed">
                No follow-ups scheduled for today.
              </Card>
            ) : (
              todaysFollowUps.map(f => (
                <Card key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-textPrimary text-[15px]">{f.leadName}</h3>
                    <p className="text-sm text-textSecondary mb-1">Follow up with {f.contactPerson}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-textMuted">
                      <span className="bg-light px-2 py-1 rounded-md">{f.type}</span>
                      <span>Today · {new Date(f.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {f.type === 'WhatsApp' && (
                      <Button variant="secondary" size="icon" onClick={() => window.open(`https://wa.me/${f.whatsapp}`, '_blank')}>
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      </Button>
                    )}
                    {f.type === 'Call' && (
                      <Button variant="secondary" size="icon" onClick={() => window.location.href = `tel:${f.phone}`}>
                        <Phone className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    <Button variant="secondary" size="icon" onClick={() => handleComplete(f.id)}>
                      <CheckCircle className="w-4 h-4 text-gray-400 hover:text-emerald-600" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-textPrimary mb-4">Recent Activity</h2>
          <Card className="p-5 md:p-6">
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <div key={activity.id} className="relative pl-6">
                  {/* Timeline line */}
                  {i !== activities.length - 1 && (
                    <div className="absolute left-1.5 top-5 bottom-[-24px] w-[2px] bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-[3px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-light" />
                  
                  <p className="text-[14px] text-textPrimary">
                    <span className="font-medium">{activity.performedBy}</span> {activity.description.toLowerCase()} for <span className="font-medium">{activity.leadName}</span>
                  </p>
                  <p className="text-xs text-textMuted mt-1">
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
