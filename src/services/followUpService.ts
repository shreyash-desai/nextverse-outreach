import { supabase } from '../config/supabase';
import type { FollowUp } from '../types';
import { getCurrentUserName } from '../utils/auth';

export const followUpService = {
  async getFollowUps(): Promise<FollowUp[]> {
    const user = getCurrentUserName();
    // Inner join with leads to only fetch follow-ups for leads assigned to the current user
    const { data, error } = await supabase
      .from('follow_ups')
      .select('*, leads!inner(assigned_to)')
      .eq('leads.assigned_to', user)
      .order('date', { ascending: true });
    
    if (error) { console.error('Error fetching follow-ups:', error); return []; }
    return data.map(mapFollowUpFromDB);
  },

  async createFollowUp(followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'completed'>): Promise<FollowUp | undefined> {
    const dbFollowUp = {
      lead_id: followUpData.leadId,
      lead_name: followUpData.leadName,
      contact_person: followUpData.contactPerson,
      phone: followUpData.phone,
      whatsapp: followUpData.whatsapp,
      date: followUpData.date,
      type: followUpData.type,
      notes: followUpData.notes,
      completed: false
    };
    const { data, error } = await supabase.from('follow_ups').insert(dbFollowUp).select().single();
    if (error) { console.error('Error creating follow-up:', error); return undefined; }
    return mapFollowUpFromDB(data);
  },

  async completeFollowUp(id: string): Promise<void> {
    await supabase.from('follow_ups').update({ completed: true }).eq('id', id);
  },

  async deleteFollowUpsForLead(leadId: string): Promise<void> {
    await supabase.from('follow_ups').delete().eq('lead_id', leadId);
  }
};

function mapFollowUpFromDB(row: any): FollowUp {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    whatsapp: row.whatsapp,
    date: row.date,
    type: row.type,
    notes: row.notes,
    completed: row.completed,
    createdAt: row.created_at,
  };
}
