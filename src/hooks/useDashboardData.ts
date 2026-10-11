import { useState, useEffect, useMemo, useRef } from 'react';
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
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [leadsData, activitiesData, followUpsData] = await Promise.all([
          leadService.getLeads(),
          activityService.getActivities(),
          followUpService.getFollowUps()
        ]);
        if (isMounted) {
          setLeads(leadsData);
          setActivities(activitiesData);
          setFollowUps(followUpsData);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Debounce realtime refreshes so rapid batch changes do not cause waterfall re-fetches
    const debouncedFetch = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchData();
      }, 300);
    };

    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follow_ups' }, debouncedFetch)
      .subscribe();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, []);

  const total = leads.length;
  const contacted = useMemo(() => leads.filter(l => l.status !== 'New').length, [leads]);
  const interested = useMemo(() => leads.filter(l => l.interest === 'Very Interested' || l.interest === 'Interested').length, [leads]);
  
  const pipeline = useMemo(() => ({
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    replied: leads.filter(l => l.status === 'Replied').length,
    interested: leads.filter(l => l.status === 'Interested' || l.interest === 'Very Interested').length,
    demo: leads.filter(l => l.status === 'Demo Scheduled').length,
    negotiation: leads.filter(l => l.status === 'Negotiation').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  }), [leads]);

  const todaysFollowUps = useMemo(() => {
    return followUps.filter(f => !f.completed && f.date && isToday(new Date(f.date)));
  }, [followUps]);

  const recentActivities = useMemo(() => activities.slice(0, 10), [activities]);

  const stats = useMemo(() => ({
    total,
    contacted,
    interested,
    converted: pipeline.converted,
    conversionRate: total ? Math.round((pipeline.converted / total) * 100) : 0,
  }), [total, contacted, interested, pipeline.converted]);

  return {
    stats,
    pipeline,
    todaysFollowUps,
    activities: recentActivities,
    leads,
    isLoading
  };
}
