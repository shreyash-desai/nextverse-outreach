import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { LeadForm } from '../components/leads/LeadForm';
import { Plus, Search, MapPin, MessageCircle, Phone, MoreHorizontal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Leads() {
  const { leads, searchQuery, setSearchQuery, statusFilter, setStatusFilter, interestFilter, setInterestFilter } = useLeads();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Leads</h1>
          <p className="text-textSecondary mt-1 text-[15px]">Goa resort prospects</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="rounded-2xl shrink-0 h-11 px-5 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-3xl shadow-sm border border-border">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search resort, contact, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-light border border-border/50 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow"
          />
        </div>
        <div className="flex gap-4 md:w-[400px]">
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
            className="rounded-2xl border-border/50 bg-light"
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
            className="rounded-2xl border-border/50 bg-light"
          />
        </div>
      </div>

      {/* Leads List/Cards */}
      {leads.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
          <p className="text-textSecondary mb-4">No leads match your search criteria.</p>
          <Button onClick={() => setIsDrawerOpen(true)} variant="secondary">Add New Lead</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leads.map((lead) => (
            <Card 
              key={lead.id} 
              className="p-5 md:p-6 flex flex-col md:flex-row gap-6 justify-between hover:border-primary/30 hover:shadow-floating transition-all group cursor-pointer"
              onClick={() => navigate(`/leads/${lead.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-textPrimary">{lead.resortName}</h3>
                  <Badge type={lead.status}>{lead.status}</Badge>
                  {['Interested', 'Very Interested'].includes(lead.interest) && (
                    <Badge type={lead.interest} className="hidden md:inline-flex">{lead.interest}</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-start gap-2 text-textSecondary text-sm">
                    <User className="w-4 h-4 mt-0.5 shrink-0 text-textMuted" />
                    <div>
                      <p className="font-medium text-textPrimary">{lead.contactPerson}</p>
                      <p className="text-xs">{lead.designation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-textSecondary text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-textMuted" />
                    <p>{lead.location}</p>
                  </div>
                  
                  <div className="hidden md:block">
                    <p className="text-xs text-textMuted mb-1">Follow-up</p>
                    <p className="text-sm font-medium text-textPrimary">
                      {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString([], {day: 'numeric', month: 'short'}) : 'None'}
                    </p>
                  </div>

                  <div className="hidden md:block">
                    <p className="text-xs text-textMuted mb-1">Assigned to</p>
                    <p className="text-sm font-medium text-textPrimary">{lead.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-xl w-10 h-10 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                  onClick={() => window.open(`https://wa.me/${lead.whatsapp}`, '_blank')}
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-xl w-10 h-10 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => window.location.href = `tel:${lead.phone}`}
                  title="Call"
                >
                  <Phone className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="More Actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
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
