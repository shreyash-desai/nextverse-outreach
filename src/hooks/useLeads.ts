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
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
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
        (lead.source && lead.source.toLowerCase().includes(query)) ||
        (lead.assignedTo && lead.assignedTo.toLowerCase().includes(query)) ||
        (lead.phone && lead.phone.includes(query));
      
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesInterest = interestFilter === 'All' || lead.interest === interestFilter;
      const matchesEmployee = employeeFilter === 'All' || lead.assignedTo === employeeFilter;
      const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesInterest && matchesEmployee && matchesSource;
    });
  }, [leads, debouncedSearch, statusFilter, interestFilter, employeeFilter, sourceFilter]);

  return {
    leads: filteredLeads,
    allLeads: leads,
    totalCount: leads.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    interestFilter,
    setInterestFilter,
    employeeFilter,
    setEmployeeFilter,
    sourceFilter,
    setSourceFilter,
    isLoading
  };
}
