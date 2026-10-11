import { useState, useEffect } from 'react';
import type { Lead, Status, Interest, Reaction } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { leadService } from '../../services/leadService';
import { activityService } from '../../services/activityService';
import { followUpService } from '../../services/followUpService';
import { getCurrentUserName, isAdmin } from '../../utils/auth';
import { userService, type User } from '../../services/userService';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LeadFormProps {
  initialData?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LeadForm({ initialData, onSuccess, onCancel }: LeadFormProps) {
  const isEditing = Boolean(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form field states
  const [resortName, setResortName] = useState(initialData?.resortName || '');
  const [contactPerson, setContactPerson] = useState(initialData?.contactPerson || '');
  const [designation, setDesignation] = useState(initialData?.designation || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [source, setSource] = useState(initialData?.source || 'Google Search');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || getCurrentUserName());
  const [status, setStatus] = useState<Status>(initialData?.status || 'New');
  const [interest, setInterest] = useState<Interest>(initialData?.interest || 'Unknown');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(initialData?.nextFollowUpDate ? initialData.nextFollowUpDate.split('T')[0] : '');
  const [followUpType, setFollowUpType] = useState<Lead['followUpType']>(initialData?.followUpType || 'None');
  const [followUpNotes, setFollowUpNotes] = useState(initialData?.followUpNotes || '');

  useEffect(() => {
    if (isAdmin()) {
      userService.getUsers().then(setUsers);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setStatusMessage(null);

    // In creation mode, resortName is essential to identify the lead
    if (!isEditing && !resortName.trim()) {
      setStatusMessage({ type: 'error', text: 'Resort name is required to create a new lead.' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (initialData) {
        // EDIT MODE: Build partial updates diff
        // Only include fields that have been modified by the salesperson.
        // Untouched fields are NEVER overwritten.
        // Cleared fields are intentionally updated to empty string/null.
        const updates: Partial<Lead> = {};

        if (resortName !== (initialData.resortName || '')) {
          updates.resortName = resortName.trim();
        }
        if (contactPerson !== (initialData.contactPerson || '')) {
          updates.contactPerson = contactPerson.trim();
        }
        if (designation !== (initialData.designation || '')) {
          updates.designation = designation.trim();
        }
        if (location !== (initialData.location || '')) {
          updates.location = location.trim();
        }
        if (phone !== (initialData.phone || '')) {
          updates.phone = phone.trim();
        }
        if (whatsapp !== (initialData.whatsapp || '')) {
          updates.whatsapp = whatsapp.trim();
        }
        if (email !== (initialData.email || '')) {
          updates.email = email.trim();
        }
        if (website !== (initialData.website || '')) {
          updates.website = website.trim();
        }
        if (source !== (initialData.source || '')) {
          updates.source = source;
        }
        if (assignedTo !== (initialData.assignedTo || '')) {
          updates.assignedTo = assignedTo;
        }
        if (status !== initialData.status) {
          updates.status = status;
        }
        if (interest !== initialData.interest) {
          updates.interest = interest;
        }
        if (notes !== (initialData.notes || '')) {
          updates.notes = notes;
        }
        const initialDateString = initialData.nextFollowUpDate ? initialData.nextFollowUpDate.split('T')[0] : '';
        if (nextFollowUpDate !== initialDateString) {
          updates.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null;
        }
        if (followUpType !== initialData.followUpType) {
          updates.followUpType = followUpType;
        }
        if (followUpNotes !== (initialData.followUpNotes || '')) {
          updates.followUpNotes = followUpNotes;
        }

        // Check if anything actually changed
        if (Object.keys(updates).length === 0) {
          setStatusMessage({ type: 'success', text: 'No changes detected. Lead is already up to date.' });
          setIsSubmitting(false);
          setTimeout(() => {
            onSuccess();
          }, 600);
          return;
        }

        const updatedLead = await leadService.updateLead(initialData.id, updates);
        if (!updatedLead) {
          throw new Error('Database failed to update lead. Please try again.');
        }

        if (updates.status && updates.status !== initialData.status) {
          await activityService.createActivity({
            leadId: initialData.id,
            leadName: updatedLead.resortName || initialData.resortName,
            type: 'Status Change',
            description: `Status changed to ${updates.status}`,
            performedBy: updatedLead.assignedTo || getCurrentUserName(),
          });
        }

        setStatusMessage({ type: 'success', text: 'Lead updated successfully!' });
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        // CREATE MODE
        const newLeadPayload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
          resortName: resortName.trim(),
          contactPerson: contactPerson.trim(),
          designation: designation.trim(),
          location: location.trim() || 'Goa',
          phone: phone.trim(),
          whatsapp: (whatsapp.trim() || phone.trim()),
          email: email.trim(),
          website: website.trim(),
          source,
          assignedTo: assignedTo || getCurrentUserName(),
          status,
          interest,
          reaction: 'Other' as Reaction,
          score: 50,
          contactMethod: 'WhatsApp',
          firstContactDate: new Date().toISOString(),
          lastContactDate: new Date().toISOString(),
          notes,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
          followUpType,
          followUpNotes,
          intelligence: {
            category: 'Other',
            propertySize: 'Unknown',
            whatsappUsage: 'Unknown',
            currentAutomation: 'None',
            potentialNeeds: [],
          }
        };

        const createdLead = await leadService.createLead(newLeadPayload);
        if (!createdLead) {
          throw new Error('Database failed to create lead. Please check your network and try again.');
        }

        await activityService.createActivity({
          leadId: createdLead.id,
          leadName: createdLead.resortName,
          type: 'Lead Created',
          description: 'New lead added to the system',
          performedBy: createdLead.assignedTo,
        });

        if (createdLead.nextFollowUpDate && createdLead.followUpType !== 'None') {
          await followUpService.createFollowUp({
            leadId: createdLead.id,
            leadName: createdLead.resortName,
            contactPerson: createdLead.contactPerson,
            phone: createdLead.phone,
            whatsapp: createdLead.whatsapp,
            date: createdLead.nextFollowUpDate,
            type: createdLead.followUpType as any,
            notes: createdLead.followUpNotes,
          });
        }

        setStatusMessage({ type: 'success', text: 'Lead created successfully!' });
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (error: any) {
      console.error('Error saving lead:', error);
      setStatusMessage({ type: 'error', text: error.message || 'An error occurred while saving.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-full">
      {/* Scrollable form body with generous bottom padding so sticky footer never overlaps */}
      <div className="space-y-6 pb-24 md:pb-20">
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {isEditing && (
          <p className="text-xs text-textSecondary bg-light px-3 py-2 rounded-xl border border-border/60">
            💡 <strong>Quick Edit:</strong> All fields are optional. Update any single detail and save without retyping untouched fields.
          </p>
        )}

        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base md:text-lg pb-1.5 border-b border-border/50 text-textPrimary">
            Basic Details
          </h3>
          <Input
            label={isEditing ? 'Resort Name (Optional)' : 'Resort Name *'}
            name="resortName"
            value={resortName}
            onChange={(e) => setResortName(e.target.value)}
            placeholder="e.g. Heritage Village Resort & Spa"
            required={!isEditing}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label={isEditing ? 'Contact Person' : 'Contact Person'}
              name="contactPerson"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
            <Input
              label="Designation"
              name="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. General Manager"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />
            <Input
              label="WhatsApp"
              type="tel"
              name="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Leave blank to use Phone"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@resort.com"
            />
            <Input
              label="Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. North Goa / Candolim"
            />
          </div>
          <Input
            label="Website"
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. https://resort.com"
          />
        </div>

        {/* Status & Pipeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base md:text-lg pb-1.5 border-b border-border/50 text-textPrimary">
            Status & Pipeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              options={[
                { value: 'New', label: 'New' },
                { value: 'Contacted', label: 'Contacted' },
                { value: 'Replied', label: 'Replied' },
                { value: 'Interested', label: 'Interested' },
                { value: 'Demo Scheduled', label: 'Demo Scheduled' },
                { value: 'Negotiation', label: 'Negotiation' },
                { value: 'Converted', label: 'Converted' },
                { value: 'Follow Up', label: 'Follow Up' },
                { value: 'Not Interested', label: 'Not Interested' }
              ]}
            />
            <Select
              label="Interest Level"
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value as Interest)}
              options={[
                { value: 'Unknown', label: 'Unknown' },
                { value: 'Very Interested', label: 'Very Interested' },
                { value: 'Interested', label: 'Interested' },
                { value: 'Maybe', label: 'Maybe' },
                { value: 'Not Interested', label: 'Not Interested' }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {isAdmin() ? (
              <Select 
                label="Assigned To" 
                name="assignedTo" 
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                options={[
                  { value: getCurrentUserName(), label: getCurrentUserName() },
                  ...users
                    .filter(u => u.username.split('@')[0] !== getCurrentUserName())
                    .map(u => ({ value: u.username.split('@')[0], label: u.username.split('@')[0] }))
                ]} 
              />
            ) : (
              <Input
                label="Assigned To"
                name="assignedTo"
                value={assignedTo}
                readOnly
                className="bg-gray-50 cursor-not-allowed opacity-75"
              />
            )}
            <Select
              label="Source"
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              options={[
                { value: 'Google Search', label: 'Google Search' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Direct', label: 'Direct' },
                { value: 'AI Assistant', label: 'AI Assistant' }
              ]}
            />
          </div>
          <Textarea
            label="Notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Key discussion points, owner background, preferences..."
          />
        </div>

        {/* Next Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base md:text-lg pb-1.5 border-b border-border/50 text-textPrimary">
            Next Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Follow-up Date"
              type="date"
              name="nextFollowUpDate"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
            <Select
              label="Follow-up Type"
              name="followUpType"
              value={followUpType}
              onChange={(e) => setFollowUpType(e.target.value as any)}
              options={[
                { value: 'None', label: 'None' },
                { value: 'WhatsApp', label: 'WhatsApp' },
                { value: 'Call', label: 'Call' },
                { value: 'Meeting', label: 'Meeting' },
                { value: 'Email', label: 'Email' }
              ]}
            />
          </div>
          <Input
            label="Follow-up Notes"
            name="followUpNotes"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            placeholder="What to follow up on..."
          />
        </div>
      </div>

      {/* Sticky Bottom Actions Bar: Never overlaps form contents on mobile or desktop */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3.5 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-end gap-3 z-20 shadow-lg mt-auto pb-safe">
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-[44px] px-5 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="min-h-[44px] px-6 rounded-xl font-medium shadow-sm"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
}
