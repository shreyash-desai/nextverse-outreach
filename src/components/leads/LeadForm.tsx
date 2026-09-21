import { useState } from 'react';
import type { Lead } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { leadService } from '../../services/leadService';
import { activityService } from '../../services/activityService';
import { followUpService } from '../../services/followUpService';

interface LeadFormProps {
  initialData?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ initialData, onSuccess, onCancel }: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      source: data.source,
      assignedTo: data.assignedTo,
      status: data.status,
      interest: data.interest,
      reaction: data.reaction,
      score: parseInt(data.score) || 0,
      contactMethod: data.contactMethod,
      firstContactDate: data.firstContactDate || new Date().toISOString(),
      lastContactDate: new Date().toISOString(),
      notes: data.notes,
      nextFollowUpDate: data.nextFollowUpDate || null,
      followUpType: data.followUpType,
      followUpNotes: data.followUpNotes,
      intelligence: {
        category: data.intelCategory || 'Unknown',
        propertySize: data.intelPropertySize || 'Unknown',
        whatsappUsage: data.intelWhatsappUsage || 'Unknown',
        currentAutomation: data.intelCurrentAutomation || 'None',
        potentialNeeds: [],
      }
    };

    try {
      if (initialData) {
        const lead = await leadService.updateLead(initialData.id, leadData);
        if (lead && lead.status !== initialData.status) {
          await activityService.createActivity({
            leadId: lead.id,
            leadName: lead.resortName,
            type: 'Status Change',
            description: `Status changed to ${lead.status}`,
            performedBy: lead.assignedTo,
          });
        }
      } else {
        const lead = await leadService.createLead(leadData);
        if (lead) {
          await activityService.createActivity({
            leadId: lead.id,
            leadName: lead.resortName,
            type: 'Lead Created',
            description: 'New lead added to the system',
            performedBy: lead.assignedTo,
          });

          if (lead.nextFollowUpDate && lead.followUpType !== 'None') {
            await followUpService.createFollowUp({
              leadId: lead.id,
              leadName: lead.resortName,
              contactPerson: lead.contactPerson,
              phone: lead.phone,
              whatsapp: lead.whatsapp,
              date: lead.nextFollowUpDate,
              type: lead.followUpType,
              notes: lead.followUpNotes,
            });
          }
        }
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg pb-2 border-b border-border/40">Basic Details</h3>
        <Input label="Resort Name" name="resortName" defaultValue={initialData?.resortName} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact Person" name="contactPerson" defaultValue={initialData?.contactPerson} required />
          <Input label="Designation" name="designation" defaultValue={initialData?.designation} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" name="phone" defaultValue={initialData?.phone} required />
          <Input label="WhatsApp" name="whatsapp" defaultValue={initialData?.whatsapp} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" type="email" name="email" defaultValue={initialData?.email} />
          <Input label="Location" name="location" defaultValue={initialData?.location} required />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg pb-2 border-b border-border/40">Status & Pipeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" name="status" defaultValue={initialData?.status || 'New'} options={[
            { value: 'New', label: 'New' },
            { value: 'Contacted', label: 'Contacted' },
            { value: 'Replied', label: 'Replied' },
            { value: 'Interested', label: 'Interested' },
            { value: 'Demo Scheduled', label: 'Demo Scheduled' },
            { value: 'Negotiation', label: 'Negotiation' },
            { value: 'Converted', label: 'Converted' },
            { value: 'Follow Up', label: 'Follow Up' },
            { value: 'Not Interested', label: 'Not Interested' }
          ]} />
          <Select label="Interest Level" name="interest" defaultValue={initialData?.interest || 'Unknown'} options={[
            { value: 'Unknown', label: 'Unknown' },
            { value: 'Very Interested', label: 'Very Interested' },
            { value: 'Interested', label: 'Interested' },
            { value: 'Maybe', label: 'Maybe' },
            { value: 'Not Interested', label: 'Not Interested' }
          ]} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Assigned To" name="assignedTo" defaultValue={initialData?.assignedTo || 'Shreyash'} required />
          <Select label="Source" name="source" defaultValue={initialData?.source || 'Google Search'} options={[
            { value: 'Google Search', label: 'Google Search' },
            { value: 'Instagram', label: 'Instagram' },
            { value: 'LinkedIn', label: 'LinkedIn' },
            { value: 'Referral', label: 'Referral' },
            { value: 'Direct', label: 'Direct' }
          ]} />
        </div>
        <Textarea label="Notes" name="notes" defaultValue={initialData?.notes} rows={3} />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg pb-2 border-b border-border/40">Next Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Follow-up Date" type="date" name="nextFollowUpDate" defaultValue={initialData?.nextFollowUpDate?.split('T')[0]} />
          <Select label="Follow-up Type" name="followUpType" defaultValue={initialData?.followUpType || 'None'} options={[
            { value: 'None', label: 'None' },
            { value: 'WhatsApp', label: 'WhatsApp' },
            { value: 'Call', label: 'Call' },
            { value: 'Meeting', label: 'Meeting' },
            { value: 'Email', label: 'Email' }
          ]} />
        </div>
        <Input label="Follow-up Notes" name="followUpNotes" defaultValue={initialData?.followUpNotes} />
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
