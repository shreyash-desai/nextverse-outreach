import type { Lead } from '../types';
import { storageService } from './storage';

const LEADS_KEY = 'nextverse_leads';

export const leadService = {
  getLeads(): Lead[] {
    return storageService.get<Lead[]>(LEADS_KEY, []);
  },
  
  getLead(id: string): Lead | undefined {
    return this.getLeads().find(lead => lead.id === id);
  },
  
  saveLeads(leads: Lead[]): void {
    storageService.set(LEADS_KEY, leads);
  },
  
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const leads = this.getLeads();
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveLeads([...leads, newLead]);
    return newLead;
  },
  
  updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === id);
    
    if (index === -1) return undefined;
    
    const updatedLead: Lead = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    leads[index] = updatedLead;
    this.saveLeads(leads);
    return updatedLead;
  },
  
  deleteLead(id: string): void {
    const leads = this.getLeads().filter(l => l.id !== id);
    this.saveLeads(leads);
  }
};
