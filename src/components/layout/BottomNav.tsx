import { NavLink } from 'react-router-dom';
import { Home, Users, CalendarCheck, BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: CalendarCheck, label: 'Follow-ups', to: '/follow-ups' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
];

export function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-surface/90 backdrop-blur-md rounded-full shadow-floating border border-border/50 px-2 py-2 flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-textMuted hover:text-textPrimary hover:bg-gray-50'
              )
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
