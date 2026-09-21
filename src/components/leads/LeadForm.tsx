import { useState } from 'react';
import type { Lead } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { leadService } from '../../services/leadService';
import { activityService } from '../../services/activityService';

interface LeadFormProps {
  initialData?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ initialData, onSuccess, onCancel }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries((formData as any).entries()) as any;

    const leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      resortName: data.resortName,
      contactPerson: data.contactPerson,
      designation: data.designation,
      location: data.location,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      email: data.email,
      website: data.website,
      
      source: data.source || 'Manual Entry',
      assignedTo: data.assignedTo || 'Shreyash',
      status: data.status,
      interest: data.interest,
      reaction: data.reaction,
      score: 10, // simplified scoring for now
      
      contactMethod: data.contactMethod,
      firstContactDate: data.firstContactDate ? new Date(data.firstContactDate).toISOString() : null,
      lastContactDate: null,
      notes: data.notes,
      
      nextFollowUpDate: data.nextFollowUpDate ? new Date(data.nextFollowUpDate).toISOString() : null,
      followUpType: data.followUpType,
      followUpNotes: data.followUpNotes,
      
      intelligence: {
        category: data.category,
        propertySize: data.propertySize,
        whatsappUsage: data.whatsappUsage,
        currentAutomation: data.currentAutomation,
        potentialNeeds: [],
      }
    };

    try {
      if (initialData) {
        leadService.updateLead(initialData.id, leadData);
        if (initialData.status !== leadData.status) {
          activityService.createActivity({
            leadId: initialData.id,
            leadName: leadData.resortName,
            type: 'Status Change',
            description: `Status changed to ${leadData.status}`,
            performedBy: leadData.assignedTo,
          });
        }
      } else {
        const newLead = leadService.createLead(leadData);
        activityService.createActivity({
          leadId: newLead.id,
          leadName: newLead.resortName,
          type: 'Lead Created',
          description: 'Added via form',
          performedBy: newLead.assignedTo,
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Resort Section */}
      <section className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Resort Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="resortName" label="Resort Name *" required defaultValue={initialData?.resortName} />
          <Input name="location" label="Location" defaultValue={initialData?.location} placeholder="e.g. Candolim, Goa" />
          <Input name="contactPerson" label="Contact Person *" required defaultValue={initialData?.contactPerson} />
          <Input name="designation" label="Designation" defaultValue={initialData?.designation} />
          <Input name="phone" label="Phone" type="tel" defaultValue={initialData?.phone} />
          <Input name="whatsapp" label="WhatsApp" type="tel" defaultValue={initialData?.whatsapp} placeholder="Leave empty to use phone" />
          <Input name="email" label="Email" type="email" defaultValue={initialData?.email} />
          <Input name="website" label="Website" defaultValue={initialData?.website} />
        </div>
      </section>

      {/* Outreach Section */}
      <section className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Outreach & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="status" label="Status" defaultValue={initialData?.status || 'New'} options={[
            {value: 'New', label: 'New'},
            {value: 'Contacted', label: 'Contacted'},
            {value: 'Replied', label: 'Replied'},
            {value: 'Interested', label: 'Interested'},
            {value: 'Demo Scheduled', label: 'Demo Scheduled'},
            {value: 'Negotiation', label: 'Negotiation'},
            {value: 'Converted', label: 'Converted'},
            {value: 'Follow Up', label: 'Follow Up'},
            {value: 'Not Interested', label: 'Not Interested'},
          ]} />
          <Select name="interest" label="Interest Level" defaultValue={initialData?.interest || 'Unknown'} options={[
            {value: 'Very Interested', label: 'Very Interested'},
            {value: 'Interested', label: 'Interested'},
            {value: 'Maybe', label: 'Maybe'},
            {value: 'Not Interested', label: 'Not Interested'},
            {value: 'Unknown', label: 'Unknown'},
          ]} />
          <Select name="reaction" label="Initial Reaction" defaultValue={initialData?.reaction || 'No Response'} options={[
            {value: 'Positive', label: 'Positive'},
            {value: 'Interested', label: 'Interested'},
            {value: 'Asked for Pricing', label: 'Asked for Pricing'},
            {value: 'No Response', label: 'No Response'},
            {value: 'Not Interested', label: 'Not Interested'},
          ]} />
          <Select name="assignedTo" label="Assigned To" defaultValue={initialData?.assignedTo || 'Shreyash'} options={[
            {value: 'Shreyash', label: 'Shreyash'},
            {value: 'Kishan', label: 'Kishan'},
          ]} />
        </div>
      </section>

      {/* Conversation Section */}
      <section className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Conversation Notes</h3>
        <div className="grid grid-cols-1 gap-4">
          <Select name="contactMethod" label="Primary Contact Method" defaultValue={initialData?.contactMethod || 'WhatsApp'} options={[
            {value: 'WhatsApp', label: 'WhatsApp'},
            {value: 'Call', label: 'Call'},
            {value: 'Email', label: 'Email'},
          ]} />
          <Textarea name="notes" label="Notes" rows={3} defaultValue={initialData?.notes} placeholder="Key takeaways from conversation..." />
        </div>
      </section>

      {/* Intelligence Section */}
      <section className="bg-surface p-6 rounded-3xl shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Resort Intelligence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select name="category" label="Category" defaultValue={initialData?.intelligence.category || 'Hotel'} options={[
            {value: 'Luxury', label: 'Luxury'},
            {value: 'Premium', label: 'Premium'},
            {value: 'Boutique', label: 'Boutique'},
            {value: 'Budget', label: 'Budget'},
            {value: 'Villa', label: 'Villa'},
            {value: 'Hotel', label: 'Hotel'},
            {value: 'Beach Resort', label: 'Beach Resort'},
          ]} />
          <Select name="whatsappUsage" label="Current WhatsApp Usage" defaultValue={initialData?.intelligence.whatsappUsage || 'Unknown'} options={[
            {value: 'No WhatsApp', label: 'No WhatsApp'},
            {value: 'Basic WhatsApp', label: 'Basic WhatsApp'},
            {value: 'WhatsApp Business', label: 'WhatsApp Business'},
            {value: 'Automated', label: 'Automated'},
            {value: 'Unknown', label: 'Unknown'},
          ]} />
        </div>
      </section>

      <div className="fixed bottom-0 right-0 w-full md:w-[600px] bg-surface p-4 border-t border-border flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? 'Save Changes' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
