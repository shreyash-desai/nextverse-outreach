import { useState, useEffect, useMemo } from 'react';
import { leadService } from '../services/leadService';
import type { Lead } from '../types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [interestFilter, setInterestFilter] = useState<string>('All');

  const loadLeads = () => {
    setLeads(leadService.getLeads().sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  useEffect(() => {
    loadLeads();
    window.addEventListener('local-storage-change', loadLeads);
    return () => window.removeEventListener('local-storage-change', loadLeads);
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        searchQuery === '' ||
        lead.resortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesInterest = interestFilter === 'All' || lead.interest === interestFilter;

      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [leads, searchQuery, statusFilter, interestFilter]);

  return {
    leads: filteredLeads,
    totalLeads: leads.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    interestFilter,
    setInterestFilter,
    refreshLeads: loadLeads
  };
}
