import { useState, useEffect, useMemo } from 'react';
import { leadService } from '../services/leadService';
import type { Lead } from '../types';
import { supabase } from '../config/supabase';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [interestFilter, setInterestFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      setIsLoading(true);
      const data = await leadService.getLeads();
      setLeads(data);
      setIsLoading(false);
    };

    fetchLeads();

    const channel = supabase.channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = 
        lead.resortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesInterest = interestFilter === 'All' || lead.interest === interestFilter;

      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [leads, searchQuery, statusFilter, interestFilter]);

  return {
    leads: filteredLeads,
    totalCount: leads.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    interestFilter,
    setInterestFilter,
    isLoading
  };
}
