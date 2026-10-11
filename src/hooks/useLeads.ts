import { useState, useEffect, useMemo } from 'react';
import { leadService } from '../services/leadService';
import type { Lead } from '../types';
import { supabase } from '../config/supabase';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [interestFilter, setInterestFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query to prevent heavy filter passes on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchLeads = async () => {
      const data = await leadService.getLeads();
      if (isMounted) {
        setLeads(data);
        setIsLoading(false);
      }
    };

    fetchLeads();

    const channel = supabase.channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return leads.filter((lead) => {
      const matchesSearch = !query || 
        (lead.resortName && lead.resortName.toLowerCase().includes(query)) ||
        (lead.contactPerson && lead.contactPerson.toLowerCase().includes(query)) ||
        (lead.location && lead.location.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.includes(query));
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesInterest = interestFilter === 'All' || lead.interest === interestFilter;

      return matchesSearch && matchesStatus && matchesInterest;
    });
  }, [leads, debouncedSearch, statusFilter, interestFilter]);

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
