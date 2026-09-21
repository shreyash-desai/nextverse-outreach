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

export function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const loadData = () => {
    if (!id) return;
    const foundLead = leadService.getLead(id);
    if (foundLead) {
      setLead(foundLead);
      setActivities(activityService.getActivitiesByLeadId(id));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('local-storage-change', loadData);
    return () => window.removeEventListener('local-storage-change', loadData);
  }, [id]);

  if (!lead) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-textSecondary">Lead not found</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-4">
        <div>
          <button 
            onClick={() => navigate('/leads')}
            className="flex items-center text-sm text-textSecondary hover:text-textPrimary mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Leads
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">{lead.resortName}</h1>
            <Badge type={lead.status}>{lead.status}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[15px] text-textSecondary">
            <span className="font-medium text-textPrimary">{lead.contactPerson}</span>
            <span>•</span>
            <span>{lead.designation}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {lead.location}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')} className="rounded-xl shadow-sm text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = `tel:${lead.phone}`} className="rounded-xl shadow-sm text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="secondary" onClick={() => setIsEditDrawerOpen(true)} className="rounded-xl shadow-sm">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Interest</p>
          <p className="font-semibold text-textPrimary"><Badge type={lead.interest} className="mt-1">{lead.interest}</Badge></p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Lead Score</p>
          <p className="text-xl font-semibold text-primary">{lead.score}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Assigned To</p>
          <p className="font-semibold text-textPrimary">{lead.assignedTo}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Reaction</p>
          <p className="font-semibold text-textPrimary">{lead.reaction}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Last Contact</p>
          <p className="font-semibold text-textPrimary text-sm">{lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}</p>
        </Card>
        <Card className="p-4 flex flex-col justify-center bg-white">
          <p className="text-[13px] font-medium text-textSecondary mb-1">Next Follow-up</p>
          <p className="font-semibold text-textPrimary text-sm">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'None'}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content (Left 2/3) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Conversation Notes</h2>
            <div className="bg-light rounded-2xl p-4 border border-border/50 text-[15px] text-textPrimary leading-relaxed whitespace-pre-wrap">
              {lead.notes || 'No notes available.'}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-textPrimary mb-6 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              Automation Opportunity
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-textSecondary mb-1">Resort Category</p>
                <p className="font-medium text-textPrimary">{lead.intelligence.category}</p>
              </div>
              <div>
                <p className="text-sm text-textSecondary mb-1">Property Size</p>
                <p className="font-medium text-textPrimary">{lead.intelligence.propertySize}</p>
              </div>
              <div>
                <p className="text-sm text-textSecondary mb-1">WhatsApp Usage</p>
                <p className="font-medium text-textPrimary">{lead.intelligence.whatsappUsage}</p>
              </div>
              <div>
                <p className="text-sm text-textSecondary mb-1">Current Automation</p>
                <p className="font-medium text-textPrimary">{lead.intelligence.currentAutomation}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-textSecondary" />
              Contact Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-textMuted" />
                <div>
                  <p className="text-sm text-textSecondary">Phone</p>
                  <p className="font-medium text-textPrimary text-sm">{lead.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 text-textMuted" />
                <div>
                  <p className="text-sm text-textSecondary">WhatsApp</p>
                  <p className="font-medium text-textPrimary text-sm">{lead.whatsapp || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-textMuted" />
                <div>
                  <p className="text-sm text-textSecondary">Email</p>
                  <p className="font-medium text-textPrimary text-sm">{lead.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 mt-0.5 text-textMuted" />
                <div>
                  <p className="text-sm text-textSecondary">Website</p>
                  <p className="font-medium text-textPrimary text-sm">{lead.website || '-'}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Activity Timeline</h2>
            <div className="space-y-5">
              {activities.length === 0 ? (
                <p className="text-sm text-textSecondary">No activity recorded.</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={activity.id} className="relative pl-6">
                    {i !== activities.length - 1 && (
                      <div className="absolute left-1.5 top-5 bottom-[-20px] w-[2px] bg-border" />
                    )}
                    <div className="absolute left-[3px] top-1.5 w-2 h-2 rounded-full bg-primary/40 ring-4 ring-white" />
                    <p className="text-[14px] text-textPrimary">
                      <span className="font-medium">{activity.performedBy}</span> {activity.description}
                    </p>
                    <p className="text-xs text-textMuted mt-0.5">
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
          onSuccess={() => setIsEditDrawerOpen(false)}
          onCancel={() => setIsEditDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}
