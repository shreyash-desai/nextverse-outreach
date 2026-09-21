export type Status = 
  | 'New'
  | 'Contacted'
  | 'Replied'
  | 'Interested'
  | 'Demo Scheduled'
  | 'Negotiation'
  | 'Converted'
  | 'Follow Up'
  | 'Not Interested'
  | 'Not Reachable'
  | 'Wrong Contact'
  | 'Lost';

export type Interest = 
  | 'Very Interested'
  | 'Interested'
  | 'Maybe'
  | 'Not Interested'
  | 'Unknown';

export type Reaction = 
  | 'Positive'
  | 'Interested'
  | 'Asked for Details'
  | 'Asked for Pricing'
  | 'Asked to Call Later'
  | 'No Response'
  | 'Not Interested'
  | 'Already Has Solution'
  | 'Wrong Person'
  | 'Other';

export interface ResortIntelligence {
  category: 'Luxury' | 'Premium' | 'Boutique' | 'Budget' | 'Villa' | 'Hotel' | 'Beach Resort' | 'Other';
  propertySize: 'Small' | 'Medium' | 'Large' | 'Unknown';
  whatsappUsage: 'No WhatsApp' | 'Basic WhatsApp' | 'WhatsApp Business' | 'Automated' | 'Unknown';
  currentAutomation: 'None' | 'Basic Auto Reply' | 'Chatbot' | 'Full Automation' | 'Unknown';
  potentialNeeds: string[]; // e.g. ['Booking Enquiries', 'FAQs']
}

export interface Lead {
  id: string;
  resortName: string;
  contactPerson: string;
  designation: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  
  // Outreach
  source: string;
  assignedTo: string;
  status: Status;
  interest: Interest;
  reaction: Reaction;
  score: number;
  
  // Conversation
  contactMethod: 'WhatsApp' | 'Call' | 'Email' | 'Other';
  firstContactDate: string | null;
  lastContactDate: string | null;
  notes: string;
  
  // Follow-up
  nextFollowUpDate: string | null;
  followUpType: 'WhatsApp' | 'Call' | 'Email' | 'Meeting' | 'None';
  followUpNotes: string;
  
  intelligence: ResortIntelligence;
  
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  leadName: string;
  type: 'Status Change' | 'Note' | 'Contact' | 'Follow-up Scheduled' | 'Lead Created';
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  date: string;
  type: 'WhatsApp' | 'Call' | 'Email' | 'Meeting';
  notes: string;
  completed: boolean;
  createdAt: string;
}
