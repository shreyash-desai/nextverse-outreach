import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import { followUpService } from '../services/followUpService';
import type { Lead, Activity, FollowUp } from '../types';
import { isToday } from 'date-fns';
import { supabase } from '../config/supabase';

export function useDashboardData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [leadsData, activitiesData, followUpsData] = await Promise.all([
        leadService.getLeads(),
        activityService.getActivities(),
        followUpService.getFollowUps()
      ]);
      setLeads(leadsData);
      setActivities(activitiesData);
      setFollowUps(followUpsData);
      setIsLoading(false);
    };

    fetchData();

    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const total = leads.length;
  const contacted = leads.filter(l => l.status !== 'New').length;
  const interested = leads.filter(l => l.interest === 'Very Interested' || l.interest === 'Interested').length;
  
  const pipeline = {
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    replied: leads.filter(l => l.status === 'Replied').length,
    interested: leads.filter(l => l.status === 'Interested' || l.interest === 'Very Interested').length,
    demo: leads.filter(l => l.status === 'Demo Scheduled').length,
    negotiation: leads.filter(l => l.status === 'Negotiation').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };

  const todaysFollowUps = followUps.filter(f => !f.completed && isToday(new Date(f.date)));
  const recentActivities = activities.slice(0, 10);

  return {
    stats: {
      total,
      contacted,
      interested,
      converted: pipeline.converted,
      conversionRate: total ? Math.round((pipeline.converted / total) * 100) : 0,
    },
    pipeline,
    todaysFollowUps,
    activities: recentActivities,
    leads,
    isLoading
  };
}
