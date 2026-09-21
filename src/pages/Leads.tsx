import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { LeadForm } from '../components/leads/LeadForm';
import { Plus, Search, MapPin, MessageCircle, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Leads() {
  const { leads, searchQuery, setSearchQuery, statusFilter, setStatusFilter, interestFilter, setInterestFilter, isLoading } = useLeads();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-28 md:pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Leads</h1>
          <p className="text-textSecondary mt-0.5 text-[14px] md:text-[15px]">Goa resort prospects</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="rounded-2xl h-10 md:h-11 px-4 md:px-5 shadow-sm text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 bg-surface p-3 md:p-4 rounded-2xl shadow-sm border border-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search resort, contact, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-light border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <Select 
            options={[
              {value: 'All', label: 'All Statuses'},
              {value: 'New', label: 'New'},
              {value: 'Contacted', label: 'Contacted'},
              {value: 'Interested', label: 'Interested'},
              {value: 'Converted', label: 'Converted'},
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-border/50 bg-light text-sm flex-1"
          />
          <Select 
            options={[
              {value: 'All', label: 'All Interests'},
              {value: 'Very Interested', label: 'Very Interested'},
              {value: 'Interested', label: 'Interested'},
              {value: 'Not Interested', label: 'Not Interested'},
            ]}
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="rounded-xl border-border/50 bg-light text-sm flex-1"
          />
        </div>
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="text-center py-20 text-textSecondary text-sm">Loading leads…</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
          <p className="text-textSecondary mb-4">No leads match your search criteria.</p>
          <Button onClick={() => setIsDrawerOpen(true)} variant="secondary">Add New Lead</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {leads.map((lead) => (
            <Card 
              key={lead.id} 
              className="p-4 md:p-5 hover:border-primary/30 hover:shadow-floating transition-all cursor-pointer active:scale-[0.99]"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              {/* Top Row: Name + badge + actions */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[15px] font-semibold text-textPrimary truncate">{lead.resortName}</h3>
                    <Badge type={lead.status}>{lead.status}</Badge>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">{lead.contactPerson} · {lead.designation}</p>
                </div>

                {/* Quick Actions — always visible on mobile */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors"
                    onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')}
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => window.location.href = `tel:${lead.phone}`}
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Row: meta */}
              <div className="flex items-center gap-3 text-xs text-textSecondary flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-textMuted" /> {lead.location}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-textMuted" /> {lead.assignedTo}
                </span>
                {lead.nextFollowUpDate && (
                  <span className="text-primary font-medium">
                    Follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString([], {day: 'numeric', month: 'short'})}
                  </span>
                )}
                {['Interested', 'Very Interested'].includes(lead.interest) && (
                  <Badge type={lead.interest}>{lead.interest}</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title="Add New Lead"
      >
        <LeadForm 
          onSuccess={() => setIsDrawerOpen(false)}
          onCancel={() => setIsDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
}
