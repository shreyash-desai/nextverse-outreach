import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { leadService } from '../services/leadService';
import { Trash2, Download } from 'lucide-react';

export function Settings() {

  const handleExportCSV = async () => {
    const leads = await leadService.getLeads();
    if (leads.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['Resort Name', 'Contact Person', 'Phone', 'Email', 'Status', 'Interest'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.resortName}"`,
        `"${lead.contactPerson}"`,
        `"${lead.phone}"`,
        `"${lead.email || ''}"`,
        `"${lead.status}"`,
        `"${lead.interest}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'nextverse_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllData = async () => {
    if (confirm('WARNING: Are you absolutely sure you want to clear ALL data from the cloud database? This cannot be undone.')) {
      const leads = await leadService.getLeads();
      for (const lead of leads) {
        await leadService.deleteLead(lead.id);
      }
      alert('Database cleared.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-2xl">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Settings</h1>
        <p className="text-textSecondary mt-1 text-[15px]">Manage your cloud data.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-textPrimary mb-4">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-light rounded-2xl border border-border/50 gap-4">
            <div>
              <p className="font-medium text-textPrimary">Export Data</p>
              <p className="text-sm text-textSecondary">Download all leads as a CSV file.</p>
            </div>
            <Button onClick={handleExportCSV} variant="secondary" className="shrink-0 bg-white">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 gap-4">
            <div>
              <p className="font-medium text-red-700">Clear All Data</p>
              <p className="text-sm text-red-600/80">Permanently delete all leads from Supabase.</p>
            </div>
            <Button onClick={handleClearAllData} variant="danger" className="shrink-0">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
