import { useDashboardData } from '../hooks/useDashboardData';
import { Card } from '../components/ui/Card';

export function Analytics() {
  const { stats, pipeline, leads, isLoading } = useDashboardData();
  
  const reactionCounts = leads.reduce((acc, lead) => {
    acc[lead.reaction] = (acc[lead.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-textSecondary text-sm">Loading…</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 md:pb-10">
      <div className="pt-4">
        <h1 className="text-2xl md:text-[28px] font-semibold text-textPrimary tracking-tight">Analytics</h1>
        <p className="text-textSecondary mt-0.5 text-[14px] md:text-[15px]">Outreach performance overview.</p>
      </div>

      {/* Stats grid — 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[11px] md:text-sm font-medium text-textSecondary mb-1">Conversion Rate</p>
          <p className="text-2xl md:text-3xl font-semibold text-emerald-600">
            {stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] md:text-sm font-medium text-textSecondary mb-1">Reply Rate</p>
          <p className="text-2xl md:text-3xl font-semibold text-primary">
            {stats.total > 0 ? Math.round(((stats.total - pipeline.new - pipeline.contacted) / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] md:text-sm font-medium text-textSecondary mb-1">Avg Lead Score</p>
          <p className="text-2xl md:text-3xl font-semibold text-textPrimary">
            {stats.total > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / stats.total) : 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] md:text-sm font-medium text-textSecondary mb-1">Total Demos</p>
          <p className="text-2xl md:text-3xl font-semibold text-textPrimary">{pipeline.demo}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-textPrimary mb-5">Outreach Funnel</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Leads', count: stats.total, max: stats.total, color: 'bg-gray-300' },
              { label: 'Contacted', count: stats.contacted, max: stats.total, color: 'bg-blue-300' },
              { label: 'Interested', count: stats.interested, max: stats.total, color: 'bg-purple-300' },
              { label: 'Demos', count: pipeline.demo, max: stats.total, color: 'bg-amber-300' },
              { label: 'Converted', count: stats.converted, max: stats.total, color: 'bg-emerald-400' },
            ].map(stage => (
              <div key={stage.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-textPrimary text-[13px]">{stage.label}</span>
                  <span className="text-textSecondary text-[13px]">{stage.count}</span>
                </div>
                <div className="h-2.5 w-full bg-light rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                    style={{ width: `${stage.max > 0 ? (stage.count / stage.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-textPrimary mb-5">Reaction Breakdown</h2>
          {Object.keys(reactionCounts).length === 0 ? (
            <p className="text-sm text-textSecondary text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(reactionCounts).sort((a, b) => b[1] - a[1]).map(([reaction, count]) => (
                <div key={reaction} className="flex items-center justify-between p-3 bg-light rounded-xl border border-border/50">
                  <span className="text-sm font-medium text-textPrimary">{reaction}</span>
                  <span className="bg-surface px-3 py-1 rounded-lg text-sm shadow-sm font-semibold text-textPrimary">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
