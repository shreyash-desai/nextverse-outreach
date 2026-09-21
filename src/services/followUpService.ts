import type { FollowUp } from '../types';
import { storageService } from './storage';

const FOLLOW_UPS_KEY = 'nextverse_followups';

export const followUpService = {
  getFollowUps(): FollowUp[] {
    return storageService.get<FollowUp[]>(FOLLOW_UPS_KEY, []);
  },
  
  getFollowUpsByLeadId(leadId: string): FollowUp[] {
    return this.getFollowUps().filter(f => f.leadId === leadId);
  },
  
  saveFollowUps(followUps: FollowUp[]): void {
    storageService.set(FOLLOW_UPS_KEY, followUps);
  },
  
  createFollowUp(followUp: Omit<FollowUp, 'id' | 'createdAt' | 'completed'>): FollowUp {
    const followUps = this.getFollowUps();
    const newFollowUp: FollowUp = {
      ...followUp,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.saveFollowUps([...followUps, newFollowUp]);
    return newFollowUp;
  },
  
  updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    const followUps = this.getFollowUps();
    const index = followUps.findIndex(f => f.id === id);
    
    if (index === -1) return undefined;
    
    const updatedFollowUp: FollowUp = {
      ...followUps[index],
      ...updates,
    };
    
    followUps[index] = updatedFollowUp;
    this.saveFollowUps(followUps);
    return updatedFollowUp;
  },
  
  completeFollowUp(id: string): FollowUp | undefined {
    return this.updateFollowUp(id, { completed: true });
  },
  
  deleteFollowUp(id: string): void {
    const followUps = this.getFollowUps().filter(f => f.id !== id);
    this.saveFollowUps(followUps);
  },
  
  deleteFollowUpsByLeadId(leadId: string): void {
    const followUps = this.getFollowUps().filter(f => f.leadId !== leadId);
    this.saveFollowUps(followUps);
  }
};
