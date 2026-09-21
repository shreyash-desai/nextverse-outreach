import { useState, useEffect } from 'react';
import { leadService } from '../services/leadService';
import { activityService } from '../services/activityService';
import { followUpService } from '../services/followUpService';
import type { Lead, Activity, FollowUp } from '../types';
import { isToday } from 'date-fns';

export function useDashboardData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const loadData = () => {
    setLeads(leadService.getLeads());
    setActivities(activityService.getActivities().slice(0, 5)); // Top 5 recent
    setFollowUps(followUpService.getFollowUps());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('local-storage-change', loadData);
    return () => window.removeEventListener('local-storage-change', loadData);
  }, []);

  const stats = {
    total: leads.length,
    contacted: leads.filter(l => l.status !== 'New').length,
    interested: leads.filter(l => ['Interested', 'Very Interested'].includes(l.interest)).length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };

  const todaysFollowUps = followUps.filter(f => !f.completed && isToday(new Date(f.date)));

  const pipeline = {
    new: leads.filter(l => l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    replied: leads.filter(l => l.status === 'Replied').length,
    interested: leads.filter(l => l.status === 'Interested').length,
    demo: leads.filter(l => l.status === 'Demo Scheduled').length,
    negotiation: leads.filter(l => l.status === 'Negotiation').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };

  return { leads, activities, followUps, stats, todaysFollowUps, pipeline, loadData };
}
