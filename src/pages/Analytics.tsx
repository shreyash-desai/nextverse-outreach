import { useDashboardData } from '../hooks/useDashboardData';
import { Card } from '../components/ui/Card';

export function Analytics() {
  const { stats, pipeline, leads } = useDashboardData();
  
  // Calculate simple reaction breakdown
  const reactionCounts = leads.reduce((acc, lead) => {
    acc[lead.reaction] = (acc[lead.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Analytics</h1>
        <p className="text-textSecondary mt-1 text-[15px]">Outreach performance overview.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-textSecondary mb-1">Conversion Rate</p>
          <p className="text-3xl font-semibold text-emerald-600">
            {stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-textSecondary mb-1">Reply Rate</p>
          <p className="text-3xl font-semibold text-primary">
            {stats.total > 0 ? Math.round(((stats.total - pipeline.new - pipeline.contacted) / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-textSecondary mb-1">Avg Lead Score</p>
          <p className="text-3xl font-semibold text-textPrimary">
            {stats.total > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / stats.total) : 0}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-textSecondary mb-1">Total Demos</p>
          <p className="text-3xl font-semibold text-textPrimary">{pipeline.demo}</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-6">Outreach Funnel</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Leads', count: stats.total, max: stats.total, color: 'bg-gray-200' },
              { label: 'Contacted', count: stats.contacted, max: stats.total, color: 'bg-blue-200' },
              { label: 'Interested', count: stats.interested, max: stats.total, color: 'bg-purple-200' },
              { label: 'Demos', count: pipeline.demo, max: stats.total, color: 'bg-amber-200' },
              { label: 'Converted', count: stats.converted, max: stats.total, color: 'bg-emerald-200' },
            ].map(stage => (
              <div key={stage.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-textPrimary">{stage.label}</span>
                  <span className="text-textSecondary">{stage.count}</span>
                </div>
                <div className="h-3 w-full bg-light rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-full`} 
                    style={{ width: `${stage.max > 0 ? (stage.count / stage.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-textPrimary mb-6">Reaction Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(reactionCounts).sort((a, b) => b[1] - a[1]).map(([reaction, count]) => (
              <div key={reaction} className="flex items-center justify-between p-3 bg-light rounded-xl border border-border/50">
                <span className="text-sm font-medium text-textPrimary">{reaction}</span>
                <span className="bg-surface px-3 py-1 rounded-lg text-sm shadow-sm">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
