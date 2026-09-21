import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import type { Lead, Activity } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { LeadForm } from '../components/leads/LeadForm';
import { MessageCircle, Phone, Edit2, ArrowLeft, Building2, MapPin, Mail, Globe, BrainCircuit } from 'lucide-react';
import { supabase } from '../config/supabase';

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!id) return;
    const foundLead = await leadService.getLead(id);
    if (foundLead) {
      setLead(foundLead);
      const acts = await activityService.getActivitiesForLead(id);
      setActivities(acts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    
    const channel = supabase.channel(`public:lead:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads', filter: `id=eq.${id}` }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `lead_id=eq.${id}` }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-textSecondary text-sm">Loading…</p>
    </div>
  );

  if (!lead) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-textSecondary">Lead not found.</p>
      <Button variant="secondary" onClick={() => navigate('/leads')}>Back to Leads</Button>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-28 md:pb-10">
      
      {/* Header */}
      <div className="pt-4">
        <button 
          onClick={() => navigate('/leads')}
          className="flex items-center text-sm text-textSecondary hover:text-textPrimary mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Leads
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-[28px] font-semibold text-textPrimary tracking-tight">{lead.resortName}</h1>
              <Badge type={lead.status}>{lead.status}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[13px] md:text-[15px] text-textSecondary flex-wrap">
              <span className="font-medium text-textPrimary">{lead.contactPerson}</span>
              <span>·</span>
              <span>{lead.designation}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {lead.location}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WA
            </button>
            <button
              onClick={() => window.location.href = `tel:${lead.phone}`}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              onClick={() => setIsEditDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-border bg-surface text-textSecondary text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Overview Mini-Cards — horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {[
          { label: 'Interest', value: <Badge type={lead.interest}>{lead.interest}</Badge> },
          { label: 'Lead Score', value: <span className="text-lg font-semibold text-primary">{lead.score}</span> },
          { label: 'Assigned To', value: lead.assignedTo },
          { label: 'Reaction', value: lead.reaction },
          { label: 'Last Contact', value: lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString([], {day:'numeric', month:'short'}) : 'Never' },
          { label: 'Next Follow-up', value: lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString([], {day:'numeric', month:'short'}) : 'None' },
        ].map((item) => (
          <Card key={item.label} className="p-3 flex flex-col justify-center min-w-[110px] shrink-0">
            <p className="text-[11px] font-medium text-textSecondary mb-1">{item.label}</p>
            <div className="font-semibold text-textPrimary text-sm">{item.value}</div>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left / full width on mobile */}
        <div className="md:col-span-2 space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-3">Conversation Notes</h2>
            <div className="bg-light rounded-xl p-4 border border-border/50 text-sm text-textPrimary leading-relaxed whitespace-pre-wrap">
              {lead.notes || 'No notes available.'}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Automation Opportunity
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Resort Category', value: lead.intelligence.category },
                { label: 'Property Size', value: lead.intelligence.propertySize },
                { label: 'WhatsApp Usage', value: lead.intelligence.whatsappUsage },
                { label: 'Current Automation', value: lead.intelligence.currentAutomation },
              ].map((i) => (
                <div key={i.label}>
                  <p className="text-xs text-textSecondary mb-0.5">{i.label}</p>
                  <p className="text-sm font-medium text-textPrimary">{i.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-textSecondary" />
              Contact Details
            </h2>
            <div className="space-y-3">
              {[
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: MessageCircle, label: 'WhatsApp', value: lead.whatsapp },
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Globe, label: 'Website', value: lead.website },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 text-textMuted shrink-0" />
                  <div>
                    <p className="text-xs text-textSecondary">{label}</p>
                    <p className="text-sm font-medium text-textPrimary">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-base font-semibold text-textPrimary mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-textSecondary">No activity recorded.</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={activity.id} className="relative pl-5">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-1 top-5 bottom-[-16px] w-[2px] bg-border" />
                    )}
                    <div className="absolute left-[-1px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-white" />
                    <p className="text-[13px] text-textPrimary">
                      <span className="font-medium">{activity.performedBy}</span> {activity.description}
                    </p>
                    <p className="text-[11px] text-textMuted mt-0.5">
                      {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Drawer 
        isOpen={isEditDrawerOpen} 
        onClose={() => setIsEditDrawerOpen(false)}
        title="Edit Lead"
      >
        <LeadForm 
          initialData={lead}
          onSuccess={() => { setIsEditDrawerOpen(false); loadData(); }}
          onCancel={() => setIsEditDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}
