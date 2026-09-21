import type { Activity } from '../types';
import { storageService } from './storage';

const ACTIVITIES_KEY = 'nextverse_activities';

export const activityService = {
  getActivities(): Activity[] {
    return storageService.get<Activity[]>(ACTIVITIES_KEY, []);
  },
  
  getActivitiesByLeadId(leadId: string): Activity[] {
    return this.getActivities().filter(a => a.leadId === leadId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  
  saveActivities(activities: Activity[]): void {
    storageService.set(ACTIVITIES_KEY, activities);
  },
  
  createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const activities = this.getActivities();
    const newActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.saveActivities([newActivity, ...activities]); // Add to beginning
    return newActivity;
  },
  
  deleteActivitiesByLeadId(leadId: string): void {
    const activities = this.getActivities().filter(a => a.leadId !== leadId);
    this.saveActivities(activities);
  }
};
