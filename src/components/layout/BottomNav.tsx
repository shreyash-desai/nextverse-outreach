import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Bot, LogOut, Shield, Menu, CalendarCheck, BarChart2, User, Settings, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/auth';
import { Drawer } from '../ui/Drawer';
import { useState } from 'react';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: Bot, label: 'Chatbot', to: '/chatbot' },
];

export function BottomNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        {isAdmin() && (
          <NavLink
            to="/team"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200',
                isActive 
                  ? 'text-purple-700 bg-purple-100' 
                  : 'text-purple-500 hover:text-purple-700 hover:bg-purple-50'
              )
            }
          >
            <Shield className="w-5 h-5 mb-0.5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Team</span>
          </NavLink>
        )}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200 text-textMuted hover:text-primary hover:bg-primary/5"
        >
          <Menu className="w-5 h-5 mb-0.5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      <Drawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu">
        <div className="flex flex-col gap-2">
          {[
            { icon: Home, label: 'Home', to: '/' },
            { icon: Users, label: 'Leads', to: '/leads' },
            { icon: CalendarCheck, label: 'Follow-ups', to: '/follow-ups' },
            { icon: BarChart2, label: 'Analytics', to: '/analytics' },
            { icon: Bot, label: 'Chatbot', to: '/chatbot' },
            { icon: User, label: 'Profile', to: '/profile' },
            { icon: Settings, label: 'Settings', to: '/settings' }
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 p-4 rounded-xl',
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-textSecondary hover:bg-gray-50'
              )}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </NavLink>
          ))}

          {isAdmin() && (
            <>
              <div className="h-px bg-border/50 my-2" />
              <NavLink to="/team" onClick={() => setIsMenuOpen(false)} className={({isActive}) => cn('flex items-center gap-3 p-4 rounded-xl', isActive ? 'bg-purple-100 text-purple-700 font-medium' : 'text-purple-600 hover:bg-purple-50')}>
                <Shield className="w-5 h-5" /> Team
              </NavLink>
              <NavLink to="/ai-logs" onClick={() => setIsMenuOpen(false)} className={({isActive}) => cn('flex items-center gap-3 p-4 rounded-xl', isActive ? 'bg-purple-100 text-purple-700 font-medium' : 'text-purple-600 hover:bg-purple-50')}>
                <Activity className="w-5 h-5" /> AI Logs
              </NavLink>
            </>
          )}

          <div className="h-px bg-border/50 my-2" />
          <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-xl text-red-600 hover:bg-red-50 w-full text-left">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </Drawer>
    </div>
  );
}
