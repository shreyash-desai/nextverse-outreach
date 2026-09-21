import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { storageService } from '../services/storage';
import { initializeDemoData } from '../data/demoData';
import { leadService } from '../services/leadService';
import { RefreshCw, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const navigate = useNavigate();

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to restore demo data? This will not delete existing records, but will add the demo records back.')) {
      localStorage.removeItem('nextverse_demo_initialized');
      initializeDemoData();
      alert('Demo data restored successfully!');
      navigate('/');
    }
  };

  const handleClearAllData = () => {
    if (confirm('WARNING: Are you absolutely sure you want to clear ALL data? This cannot be undone.')) {
      storageService.clearAll();
      alert('All data cleared.');
      navigate('/');
    }
  };

  const handleExportCSV = () => {
    const leads = leadService.getLeads();
    if (leads.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['Resort Name', 'Contact Person', 'Designation', 'Phone', 'WhatsApp', 'Email', 'Location', 'Status', 'Interest', 'Reaction', 'Assigned To'];
    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const values = [
        `"${lead.resortName}"`,
        `"${lead.contactPerson}"`,
        `"${lead.designation}"`,
        `"${lead.phone}"`,
        `"${lead.whatsapp}"`,
        `"${lead.email}"`,
        `"${lead.location}"`,
        `"${lead.status}"`,
        `"${lead.interest}"`,
        `"${lead.reaction}"`,
        `"${lead.assignedTo}"`,
      ];
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `nextverse-leads-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-2xl">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Settings</h1>
        <p className="text-textSecondary mt-1 text-[15px]">Manage your local data.</p>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-light rounded-2xl border border-border/50 gap-4">
            <div>
              <p className="font-medium text-textPrimary">Restore Demo Data</p>
              <p className="text-sm text-textSecondary">Inject demo records back into the CRM.</p>
            </div>
            <Button onClick={handleResetDemoData} variant="secondary" className="shrink-0 bg-white text-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Restore
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 gap-4">
            <div>
              <p className="font-medium text-red-700">Clear All Data</p>
              <p className="text-sm text-red-600/80">Permanently delete all leads and activities.</p>
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
