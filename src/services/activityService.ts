import { supabase } from '../config/supabase';
import type { Activity } from '../types';

export const activityService = {
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase.from('activities').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching activities:', error); return []; }
    return data.map(mapActivityFromDB);
  },
  
  async getActivitiesForLead(leadId: string): Promise<Activity[]> {
    const { data, error } = await supabase.from('activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
    if (error) { console.error('Error fetching activities for lead:', error); return []; }
    return data.map(mapActivityFromDB);
  },

  async createActivity(activityData: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity | undefined> {
    const dbActivity = {
      lead_id: activityData.leadId,
      lead_name: activityData.leadName,
      type: activityData.type,
      description: activityData.description,
      performed_by: activityData.performedBy
    };
    const { data, error } = await supabase.from('activities').insert(dbActivity).select().single();
    if (error) { console.error('Error creating activity:', error); return undefined; }
    return mapActivityFromDB(data);
  },

  async deleteActivitiesForLead(leadId: string): Promise<void> {
    await supabase.from('activities').delete().eq('lead_id', leadId);
  }
};

function mapActivityFromDB(row: any): Activity {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    type: row.type,
    description: row.description,
    performedBy: row.performed_by,
    createdAt: row.created_at,
  };
}
