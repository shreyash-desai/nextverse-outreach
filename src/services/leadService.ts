import { supabase } from '../config/supabase';
import type { Lead } from '../types';

export const leadService = {
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching leads:', error); return []; }
    return data.map(mapLeadFromDB);
  },
  
  async getLead(id: string): Promise<Lead | undefined> {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();
    if (error) { console.error('Error fetching lead:', error); return undefined; }
    return mapLeadFromDB(data);
  },

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | undefined> {
    const dbLead = mapLeadToDB(leadData);
    const { data, error } = await supabase.from('leads').insert(dbLead).select().single();
    if (error) { console.error('Error creating lead:', error); return undefined; }
    return mapLeadFromDB(data);
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | undefined> {
    const dbUpdates = mapLeadToDB(updates as any);
    dbUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('leads').update(dbUpdates).eq('id', id).select().single();
    if (error) { console.error('Error updating lead:', error); return undefined; }
    return mapLeadFromDB(data);
  },

  async deleteLead(id: string): Promise<void> {
    await supabase.from('leads').delete().eq('id', id);
  }
};

function mapLeadFromDB(row: any): Lead {
  return {
    id: row.id,
    resortName: row.resort_name,
    contactPerson: row.contact_person,
    designation: row.designation,
    location: row.location,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    source: row.source,
    assignedTo: row.assigned_to,
    status: row.status,
    interest: row.interest,
    reaction: row.reaction,
    score: row.score,
    contactMethod: row.contact_method,
    firstContactDate: row.first_contact_date,
    lastContactDate: row.last_contact_date,
    notes: row.notes,
    nextFollowUpDate: row.next_follow_up_date,
    followUpType: row.follow_up_type,
    followUpNotes: row.follow_up_notes,
    intelligence: row.intelligence,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLeadToDB(lead: any): any {
  const row: any = {};
  if (lead.resortName !== undefined) row.resort_name = lead.resortName;
  if (lead.contactPerson !== undefined) row.contact_person = lead.contactPerson;
  if (lead.designation !== undefined) row.designation = lead.designation;
  if (lead.location !== undefined) row.location = lead.location;
  if (lead.phone !== undefined) row.phone = lead.phone;
  if (lead.whatsapp !== undefined) row.whatsapp = lead.whatsapp;
  if (lead.email !== undefined) row.email = lead.email;
  if (lead.website !== undefined) row.website = lead.website;
  if (lead.source !== undefined) row.source = lead.source;
  if (lead.assignedTo !== undefined) row.assigned_to = lead.assignedTo;
  if (lead.status !== undefined) row.status = lead.status;
  if (lead.interest !== undefined) row.interest = lead.interest;
  if (lead.reaction !== undefined) row.reaction = lead.reaction;
  if (lead.score !== undefined) row.score = lead.score;
  if (lead.contactMethod !== undefined) row.contact_method = lead.contactMethod;
  if (lead.firstContactDate !== undefined) row.first_contact_date = lead.firstContactDate;
  if (lead.lastContactDate !== undefined) row.last_contact_date = lead.lastContactDate;
  if (lead.notes !== undefined) row.notes = lead.notes;
  if (lead.nextFollowUpDate !== undefined) row.next_follow_up_date = lead.nextFollowUpDate;
  if (lead.followUpType !== undefined) row.follow_up_type = lead.followUpType;
  if (lead.followUpNotes !== undefined) row.follow_up_notes = lead.followUpNotes;
  if (lead.intelligence !== undefined) row.intelligence = lead.intelligence;
  return row;
}
