import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { leadService } from '../services/leadService';
import { Download } from 'lucide-react';
import { isAdmin } from '../utils/auth';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const leads = await leadService.getLeads();
      if (leads.length === 0) {
        alert('No data to export.');
        return;
      }

      const headers = ['Resort Name', 'Contact Person', 'Designation', 'Phone', 'WhatsApp', 'Email', 'Location', 'Status', 'Interest', 'Assigned To'];
      const csvContent = [
        headers.join(','),
        ...leads.map(lead => [
          `"${(lead.resortName || '').replace(/"/g, '""')}"`,
          `"${(lead.contactPerson || '').replace(/"/g, '""')}"`,
          `"${(lead.designation || '').replace(/"/g, '""')}"`,
          `"${(lead.phone || '').replace(/"/g, '""')}"`,
          `"${(lead.whatsapp || '').replace(/"/g, '""')}"`,
          `"${(lead.email || '').replace(/"/g, '""')}"`,
          `"${(lead.location || '').replace(/"/g, '""')}"`,
          `"${(lead.status || '').replace(/"/g, '""')}"`,
          `"${(lead.interest || '').replace(/"/g, '""')}"`,
          `"${(lead.assignedTo || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `nextverse_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export leads. Please check console.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-28 md:pb-10 max-w-2xl">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Settings</h1>
        <p className="text-textSecondary mt-1 text-[15px]">Manage CRM configurations and export data.</p>
      </div>

      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-textPrimary mb-4">Data Management</h2>
        
        {isAdmin() ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-light rounded-2xl border border-border/50 gap-4">
              <div>
                <p className="font-medium text-textPrimary">Export Leads Data</p>
                <p className="text-sm text-textSecondary">Download active leads as a clean CSV file with contact and assignment details.</p>
              </div>
              <Button onClick={handleExportCSV} variant="secondary" disabled={isExporting} className="shrink-0 bg-white">
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-textSecondary text-sm">You do not have administrative permissions to export organization data. Please contact an administrator.</p>
        )}
      </Card>
    </div>
  );
}
