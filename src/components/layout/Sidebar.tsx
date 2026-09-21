import { NavLink } from 'react-router-dom';
import { Home, Users, CalendarCheck, BarChart2, User, Settings } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: Home, label: 'Dashboard', to: '/' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: CalendarCheck, label: 'Follow-ups', to: '/follow-ups' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics' },
];

const bottomItems = [
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 fixed left-6 top-6 bottom-6 z-40 bg-surface rounded-3xl shadow-floating border border-border p-4 transition-all">
      <div className="flex items-center justify-center lg:justify-start lg:px-4 h-12 mb-8 mt-2">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">NV</span>
        </div>
        <span className="ml-3 font-semibold text-textPrimary text-lg hidden lg:block tracking-tight">
          Nextverse
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center lg:px-4 py-3 rounded-2xl transition-all duration-200 group',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
              )
            }
            title={item.label}
          >
            {({ isActive }) => (
              <>
                <div className="w-10 h-10 lg:w-auto lg:h-auto mx-auto lg:mx-0 flex items-center justify-center lg:block">
                  <item.icon 
                    className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} 
                  />
                </div>
                <span className="ml-3 font-medium text-sm hidden lg:block">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/50 space-y-2">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center lg:px-4 py-3 rounded-2xl transition-all duration-200 group',
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-textSecondary hover:bg-gray-50 hover:text-textPrimary'
              )
            }
            title={item.label}
          >
            <div className="w-10 h-10 lg:w-auto lg:h-auto mx-auto lg:mx-0 flex items-center justify-center lg:block">
              <item.icon className="w-5 h-5 stroke-[2px]" />
            </div>
            <span className="ml-3 font-medium text-sm hidden lg:block">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
