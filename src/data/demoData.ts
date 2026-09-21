import type { Lead } from '../types';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import { followUpService } from '../services/followUpService';

const DEMO_INIT_KEY = 'nextverse_demo_initialized';

const generateDemoLeads = (): Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] => [
  {
    resortName: 'Azure Palm Retreat',
    contactPerson: 'Arjun Mehta',
    designation: 'General Manager',
    location: 'Candolim',
    phone: '9876543210',
    whatsapp: '9876543210',
    email: 'arjun@azurepalmretreat.demo',
    website: 'azurepalmretreat.demo',
    source: 'Google Search',
    assignedTo: 'Shreyash',
    status: 'Interested',
    interest: 'Very Interested',
    reaction: 'Asked for Pricing',
    score: 35,
    contactMethod: 'WhatsApp',
    firstContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Very interested in automating booking inquiries. Current process is too manual.',
    nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    followUpType: 'WhatsApp',
    followUpNotes: 'Send pricing deck',
    intelligence: {
      category: 'Premium',
      propertySize: 'Medium',
      whatsappUsage: 'WhatsApp Business',
      currentAutomation: 'Basic Auto Reply',
      potentialNeeds: ['Booking Enquiries', 'FAQs'],
    },
  },
  {
    resortName: 'Ocean Pearl Villas',
    contactPerson: 'Rohan Kapoor',
    designation: 'Owner',
    location: 'Vagator',
    phone: '9876543211',
    whatsapp: '9876543211',
    email: 'rohan@oceanpearl.demo',
    website: 'oceanpearl.demo',
    source: 'LinkedIn',
    assignedTo: 'Kishan',
    status: 'Contacted',
    interest: 'Maybe',
    reaction: 'Asked to Call Later',
    score: 15,
    contactMethod: 'Call',
    firstContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Busy with season preparations. Call back next week.',
    nextFollowUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    followUpType: 'Call',
    followUpNotes: 'Check if he is free for a quick intro',
    intelligence: {
      category: 'Villa',
      propertySize: 'Small',
      whatsappUsage: 'No WhatsApp',
      currentAutomation: 'None',
      potentialNeeds: ['Location / Directions', 'Check-in / Check-out'],
    },
  },
  {
    resortName: 'Palm Grove Escape',
    contactPerson: 'Nisha Malhotra',
    designation: 'Marketing Manager',
    location: 'Benaulim',
    phone: '9876543212',
    whatsapp: '9876543212',
    email: 'nisha@palmgrove.demo',
    website: 'palmgrove.demo',
    source: 'Instagram',
    assignedTo: 'Shreyash',
    status: 'Follow Up',
    interest: 'Unknown',
    reaction: 'No Response',
    score: 5,
    contactMethod: 'WhatsApp',
    firstContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Sent initial message. No response yet.',
    nextFollowUpDate: new Date().toISOString(),
    followUpType: 'WhatsApp',
    followUpNotes: 'Send second follow-up message',
    intelligence: {
      category: 'Boutique',
      propertySize: 'Medium',
      whatsappUsage: 'WhatsApp Business',
      currentAutomation: 'Unknown',
      potentialNeeds: ['Review Requests'],
    },
  },
  {
    resortName: 'Sun sand & Sea Resort',
    contactPerson: 'Vikram Singh',
    designation: 'Operations Head',
    location: 'Calangute',
    phone: '9876543213',
    whatsapp: '9876543213',
    email: 'vikram@sunsandsea.demo',
    website: 'sunsandsea.demo',
    source: 'Direct',
    assignedTo: 'Kishan',
    status: 'Demo Scheduled',
    interest: 'Very Interested',
    reaction: 'Positive',
    score: 40,
    contactMethod: 'WhatsApp',
    firstContactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Excited about the chatbot features for room service requests.',
    nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    followUpType: 'Meeting',
    followUpNotes: 'Demo the room service automation flow',
    intelligence: {
      category: 'Beach Resort',
      propertySize: 'Large',
      whatsappUsage: 'WhatsApp Business',
      currentAutomation: 'Basic Auto Reply',
      potentialNeeds: ['Room Information', 'Human Handoff'],
    },
  },
  {
    resortName: 'Tranquil Shores',
    contactPerson: 'Sneha Patel',
    designation: 'Owner',
    location: 'Ashwem',
    phone: '9876543214',
    whatsapp: '9876543214',
    email: 'sneha@tranquilshores.demo',
    website: '',
    source: 'Referral',
    assignedTo: 'Shreyash',
    status: 'Converted',
    interest: 'Very Interested',
    reaction: 'Positive',
    score: 50,
    contactMethod: 'WhatsApp',
    firstContactDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Signed contract for full automation suite.',
    nextFollowUpDate: null,
    followUpType: 'None',
    followUpNotes: '',
    intelligence: {
      category: 'Boutique',
      propertySize: 'Small',
      whatsappUsage: 'WhatsApp Business',
      currentAutomation: 'Full Automation',
      potentialNeeds: ['Booking Enquiries'],
    },
  }
];

export const initializeDemoData = () => {
  if (localStorage.getItem(DEMO_INIT_KEY)) {
    return; // Already initialized
  }

  const demoLeads = generateDemoLeads();
  
  demoLeads.forEach(leadData => {
    const lead = leadService.createLead(leadData);
    
    // Create initial activity
    activityService.createActivity({
      leadId: lead.id,
      leadName: lead.resortName,
      type: 'Lead Created',
      description: 'Added from demo data generation',
      performedBy: 'System',
    });

    // Create activity for status
    if (lead.status !== 'New') {
      activityService.createActivity({
        leadId: lead.id,
        leadName: lead.resortName,
        type: 'Status Change',
        description: `Status changed to ${lead.status}`,
        performedBy: lead.assignedTo,
      });
    }

    // Create follow up if applicable
    if (lead.nextFollowUpDate && lead.followUpType !== 'None') {
      followUpService.createFollowUp({
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
  });

  localStorage.setItem(DEMO_INIT_KEY, 'true');
};
